"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Clock, CalendarDays, AlertCircle } from "lucide-react";
import { WorkingSchedule } from "@/types";
import { scheduleService, CreateSchedulePayload, ScheduleLinePayload } from "@/services/scheduleService";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiError } from "@/services/apiClient";

import { Modal } from "@/components/common/Modal";

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
] as const;

const dayConfigSchema = z.object({
  key: z.string(),
  enabled: z.boolean(),
  startTime: z.string().min(5, "Start time required"),
  endTime: z.string().min(5, "End time required"),
  breakHours: z.number().min(0, "Break cannot be negative").max(12, "Break cannot exceed 12 hours"),
});

const scheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required *"),
  type: z.enum(["STANDARD", "SHIFT", "FLEXIBLE"]),
  days: z.array(dayConfigSchema).refine((days) => days.some(d => d.enabled), {
    message: "At least one working day must be enabled",
  }),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleFormModalProps {
  schedule?: WorkingSchedule | null;
  onClose: () => void;
  onSuccess: (schedule: WorkingSchedule) => void;
}

export function ScheduleFormModal({ schedule, onClose, onSuccess }: ScheduleFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});

  const initialDays = DAYS_OF_WEEK.map(({ key }) => {
    const existing = schedule?.lines?.find((l) => l.dayOfWeek === key);
    return {
      key,
      enabled: Boolean(existing) || (!schedule && ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].includes(key)),
      startTime: existing?.startTime ? existing.startTime.slice(0, 5) : "09:00",
      endTime: existing?.endTime ? existing.endTime.slice(0, 5) : "17:00",
      breakHours: existing?.breakHours ?? 1,
    };
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: schedule?.name || "",
      type: (schedule?.type as any) || "STANDARD",
      days: initialDays,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "days",
  });

  const watchDays = watch("days");

  useEffect(() => {
    if (schedule) {
      const initialDays = DAYS_OF_WEEK.map(({ key }) => {
        const existing = schedule?.lines?.find((l) => l.dayOfWeek === key);
        return {
          key,
          enabled: Boolean(existing) || (!schedule && ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].includes(key)),
          startTime: existing?.startTime ? existing.startTime.slice(0, 5) : "09:00",
          endTime: existing?.endTime ? existing.endTime.slice(0, 5) : "17:00",
          breakHours: existing?.breakHours ?? 1,
        };
      });

      reset({
        name: schedule.name || "",
        type: (schedule.type as any) || "STANDARD",
        days: initialDays,
      });
      setGlobalError(null);
      setLineErrors({});
    }
  }, [schedule, reset]);

  const calculateDayHours = (cfg: { enabled: boolean; startTime: string; endTime: string; breakHours: number }): number => {
    if (!cfg.enabled) return 0;
    const [sh, sm] = (cfg.startTime || "00:00").split(":").map(Number);
    const [eh, em] = (cfg.endTime || "00:00").split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const diffHours = (endMins - startMins) / 60;
    return Math.max(0, diffHours - (cfg.breakHours || 0));
  };

  const totalWeekly = (watchDays || []).reduce((sum, d) => sum + calculateDayHours(d), 0);

  const onSubmit = async (data: ScheduleFormValues) => {
    setSubmitting(true);
    setGlobalError(null);
    setLineErrors({});

    // Validate ALL enabled days simultaneously
    const dayErrors: Record<string, string> = {};
    const lines: ScheduleLinePayload[] = [];

    data.days.forEach((cfg) => {
      if (cfg.enabled) {
        const [sh, sm] = (cfg.startTime || "00:00").split(":").map(Number);
        const [eh, em] = (cfg.endTime || "00:00").split(":").map(Number);
        const startMins = sh * 60 + sm;
        const endMins = eh * 60 + em;
        const shiftDurationHours = (endMins - startMins) / 60;

        if (endMins <= startMins) {
          dayErrors[cfg.key] = `${cfg.key}: End time must be after start time.`;
        } else if (cfg.breakHours > shiftDurationHours) {
          dayErrors[cfg.key] = `${cfg.key}: Break (${cfg.breakHours}h) cannot exceed shift duration (${shiftDurationHours.toFixed(1)}h).`;
        } else if (cfg.breakHours > 12) {
          dayErrors[cfg.key] = `${cfg.key}: Break cannot exceed 12 hours limit.`;
        }

        lines.push({
          dayOfWeek: cfg.key,
          startTime: `${cfg.startTime}:00`,
          endTime: `${cfg.endTime}:00`,
          breakHours: cfg.breakHours || 0,
        });
      }
    });

    if (Object.keys(dayErrors).length > 0) {
      setLineErrors(dayErrors);
      setSubmitting(false);
      return;
    }

    const payload: CreateSchedulePayload = { name: data.name.trim(), type: data.type, lines };

    try {
      const res = schedule ? await scheduleService.update(schedule.id, payload) : await scheduleService.create(payload);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof ScheduleFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (!hasFieldErrors) {
           setGlobalError(err.message || "An error occurred");
        }
      } else {
        setGlobalError(err?.message || "Failed to save schedule");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={schedule ? "Edit Working Schedule" : "New Working Schedule"}
      subtitle="Configure weekly operating hours and daily breaks"
      maxWidth="2xl"
    >
      {globalError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <div>
            <span className="font-semibold">Operation Failed:</span>
            <p className="mt-0.5">{globalError}</p>
          </div>
        </div>
      )}

      {Object.keys(lineErrors).length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <span className="font-semibold">Schedule Line Validation Errors:</span>
            <ul className="mt-1 space-y-0.5 list-disc list-inside text-[11px]">
              {Object.values(lineErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {errors.days?.root && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <div>
            <span className="font-semibold">Validation Error:</span>
            <p className="mt-0.5">{errors.days.root.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Schedule Name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Standard 40h (Mon-Fri)"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${errors.name ? 'border-red-500' : 'border-border'} bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-medium`}
            />
            {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Schedule Type</label>
            <select
              {...register("type")}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
            >
              <option value="STANDARD">Standard</option>
              <option value="SHIFT">Shift</option>
              <option value="FLEXIBLE">Flexible</option>
            </select>
          </div>
        </div>

        <div className="border border-border rounded-2xl p-4 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Schedule Lines</span>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tabular-nums">Total: {totalWeekly.toFixed(1)} hrs/week</span>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => {
              const dayConfig = watchDays?.[index];
              const label = DAYS_OF_WEEK.find(d => d.key === field.key)?.label;
              const isEnabled = dayConfig?.enabled;
              const dayHrs = dayConfig ? calculateDayHours(dayConfig) : 0;

              return (
                <div
                  key={field.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all border ${
                    isEnabled
                      ? "bg-card border-border shadow-xs"
                      : "bg-muted/40 border-transparent opacity-50"
                  }`}
                >
                  <label className="flex items-center gap-2.5 w-18 cursor-pointer font-semibold text-foreground">
                    <input
                      type="checkbox"
                      {...register(`days.${index}.enabled`)}
                      className="rounded text-teal-600 focus:ring-teal-500/40 cursor-pointer h-4 w-4"
                    />
                    <span>{label}</span>
                  </label>

                  {isEnabled ? (
                    <div className="flex items-center gap-2.5 flex-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <input
                          type="time"
                          {...register(`days.${index}.startTime`)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card text-foreground tabular-nums"
                        />
                        <span className="text-muted-foreground text-[11px]">to</span>
                        <input
                          type="time"
                          {...register(`days.${index}.endTime`)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card text-foreground tabular-nums"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Break:</span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          {...register(`days.${index}.breakHours`, { valueAsNumber: true })}
                          className="w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground tabular-nums text-center"
                        />
                        <span className="text-[11px] text-muted-foreground">h</span>
                      </div>
                      <span className="ml-auto font-bold text-foreground tabular-nums text-xs">{dayHrs.toFixed(1)}h</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Off day</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors apple-press cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50 transition-all apple-press cursor-pointer"
          >
            {submitting ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
