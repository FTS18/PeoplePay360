"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, AlertCircle, Loader2, Clock, Sparkles } from "lucide-react";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffType, TimeOffRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiError } from "@/services/apiClient";

const leaveSchema = z.object({
  timeOffTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  requestedUnits: z.number().min(0.5, "Minimum 0.5 units required"),
  reason: z.string().optional(),
}).refine((data) => {
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: "End date cannot be before start date",
  path: ["endDate"],
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface ApplyLeaveModalProps {
  isOpen: boolean;
  types: TimeOffType[];
  onClose: () => void;
  onSuccess: (request: TimeOffRequest) => void;
}

const inputClass =
  "w-full rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-stone-50 dark:bg-[var(--card)] px-4 py-3 text-[13px] font-medium text-[var(--foreground)] placeholder:text-stone-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm shadow-black/[0.02]";
const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const addDaysStr = (startDateStr: string, days: number): string => {
  if (!startDateStr) return getTodayStr();
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return getTodayStr();
  date.setDate(date.getDate() + Math.max(0, Math.ceil(days) - 1));
  return date.toISOString().slice(0, 10);
};

const calcDaysDiff = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 1;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 1;
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

const formatDateLabel = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function ApplyLeaveModal({ isOpen, types, onClose, onSuccess }: ApplyLeaveModalProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultStart = getTodayStr();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      timeOffTypeId: types[0]?.id || "",
      startDate: defaultStart,
      endDate: defaultStart,
      requestedUnits: 1,
      reason: "",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const requestedUnits = watch("requestedUnits");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setGlobalError(null);
      const today = getTodayStr();
      reset({
        timeOffTypeId: types[0]?.id || "",
        startDate: today,
        endDate: today,
        requestedUnits: 1,
        reason: "",
      });
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, types, reset, onClose]);

  if (!isOpen || !mounted) return null;

  // Handlers for bidirectional synchronization
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setValue("startDate", newStart, { shouldValidate: true });
    
    if (newStart) {
      const newEnd = addDaysStr(newStart, requestedUnits || 1);
      setValue("endDate", newEnd, { shouldValidate: true });
      clearErrors("endDate");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    
    if (startDate && newEnd) {
      if (newEnd < startDate) {
        // Auto-fix invalid date range by setting endDate to startDate
        const autoEnd = addDaysStr(startDate, requestedUnits || 1);
        setValue("endDate", autoEnd, { shouldValidate: true });
      } else {
        setValue("endDate", newEnd, { shouldValidate: true });
        const days = calcDaysDiff(startDate, newEnd);
        setValue("requestedUnits", days, { shouldValidate: true });
      }
      clearErrors("endDate");
    } else {
      setValue("endDate", newEnd, { shouldValidate: true });
    }
  };

  const handleRequestedUnitsChange = (val: number) => {
    const safeUnits = Math.max(0.5, val);
    setValue("requestedUnits", safeUnits, { shouldValidate: true });

    if (startDate) {
      const newEnd = addDaysStr(startDate, safeUnits);
      setValue("endDate", newEnd, { shouldValidate: true });
      clearErrors("endDate");
    }
  };

  const onSubmit = async (data: LeaveFormValues) => {
    if (!user) return;
    setLoading(true);
    setGlobalError(null);

    try {
      const created = await timeoffService.applyLeave({
        employeeId: user.id,
        timeOffTypeId: data.timeOffTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        requestedUnits: data.requestedUnits,
        reason: data.reason || "",
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof LeaveFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (!hasFieldErrors) {
           setGlobalError(err.message || "An error occurred");
        }
      } else if (err instanceof ApiError && err.status === 409) {
         setGlobalError(err.message || "Conflict: The requested time off overlaps with an already approved leave request.");
      } else {
        setGlobalError(err?.message || "Failed to submit leave request");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedType = types.find((t) => t.id === watch("timeOffTypeId"));

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-apple-modal border border-[var(--border)] dark:border-stone-700/80 bg-white/95 dark:bg-[var(--card)] max-h-[90vh] my-auto overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] dark:border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Request Time Off</h3>
              <p className="text-xs text-[var(--muted-foreground)]">Smart bidirectional date & duration calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-[var(--muted)] dark:hover:bg-stone-800 transition-colors apple-press"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {globalError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div>
              <span className="font-semibold">Operation Failed:</span>
              <p className="mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 ml-1">Leave Category</label>
            <div className="relative">
              <select
                {...register("timeOffTypeId")}
                className={`${inputClass} appearance-none ${errors.timeOffTypeId ? errorInputClass : ""}`}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.unit})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-stone-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.timeOffTypeId && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.timeOffTypeId.message}</p>}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-500" strokeWidth={1.75} />
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "0.5 Day", units: 0.5 },
                { label: "1 Day", units: 1 },
                { label: "2 Days", units: 2 },
                { label: "3 Days", units: 3 },
                { label: "5 Days (1 Wk)", units: 5 },
                { label: "10 Days", units: 10 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleRequestedUnitsChange(p.units)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer apple-press ${
                    requestedUnits === p.units
                      ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 ml-1">From Date</label>
              <input
                type="date"
                value={startDate || ""}
                onChange={handleStartDateChange}
                className={`${inputClass} ${errors.startDate ? errorInputClass : ""}`}
              />
              {errors.startDate && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 ml-1">To Date</label>
              <input
                type="date"
                value={endDate || ""}
                onChange={handleEndDateChange}
                className={`${inputClass} ${errors.endDate ? errorInputClass : ""}`}
              />
              {errors.endDate && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Interactive Calculated Duration & Auto Sync */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.75} />
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200">Calculated Duration</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={requestedUnits || 1}
                  onChange={(e) => handleRequestedUnitsChange(parseFloat(e.target.value) || 0.5)}
                  className="w-20 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-stone-900 px-2 py-1 text-center text-sm font-extrabold text-teal-700 dark:text-teal-300 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                  {selectedType?.unit || "Days"}
                </span>
              </div>
            </div>

            {/* Human Summary Pill */}
            {startDate && endDate && (
              <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 text-center bg-teal-100/60 dark:bg-teal-900/40 py-1 px-2.5 rounded-lg border border-teal-200/80 dark:border-teal-800/80">
                {startDate === endDate ? (
                  <span>{formatDateLabel(startDate)} ({requestedUnits} {selectedType?.unit || "Day"})</span>
                ) : (
                  <span>
                    {formatDateLabel(startDate)} &rarr; {formatDateLabel(endDate)} ({requestedUnits} {selectedType?.unit || "Days"})
                  </span>
                )}
              </div>
            )}
          </div>
          {errors.requestedUnits && <p className="text-[10px] text-red-500 ml-1">{errors.requestedUnits.message}</p>}

          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5 ml-1">Additional Notes</label>
            <textarea
              {...register("reason")}
              className={`${inputClass} min-h-[80px] resize-none ${errors.reason ? errorInputClass : ""}`}
              placeholder="Provide context for this leave request..."
            />
            {errors.reason && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.reason.message}</p>}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="apple-press w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 py-3.5 text-[13px] font-bold text-white shadow-apple-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
