"use client";

import React, { useState } from "react";
import { X, Clock, CalendarDays } from "lucide-react";
import { WorkingSchedule } from "@/types";
import { scheduleService, CreateSchedulePayload, ScheduleLinePayload } from "@/services/scheduleService";

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
] as const;

interface DayConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakHours: number;
}

interface ScheduleFormModalProps {
  schedule?: WorkingSchedule | null;
  onClose: () => void;
  onSuccess: (schedule: WorkingSchedule) => void;
}

export function ScheduleFormModal({ schedule, onClose, onSuccess }: ScheduleFormModalProps) {
  const [name, setName] = useState(schedule?.name || "");
  const [type, setType] = useState<"STANDARD" | "SHIFT" | "FLEXIBLE">(
    (schedule?.type as "STANDARD" | "SHIFT" | "FLEXIBLE") || "STANDARD"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialDays: Record<string, DayConfig> = {};
  DAYS_OF_WEEK.forEach(({ key }) => {
    const existing = schedule?.lines?.find((l) => l.dayOfWeek === key);
    initialDays[key] = {
      enabled: Boolean(existing) || (!schedule && ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].includes(key)),
      startTime: existing?.startTime ? existing.startTime.slice(0, 5) : "09:00",
      endTime: existing?.endTime ? existing.endTime.slice(0, 5) : "17:00",
      breakHours: existing?.breakHours ?? 1,
    };
  });

  const [days, setDays] = useState<Record<string, DayConfig>>(initialDays);

  const calculateDayHours = (cfg: DayConfig): number => {
    if (!cfg.enabled) return 0;
    const [sh, sm] = cfg.startTime.split(":").map(Number);
    const [eh, em] = cfg.endTime.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const diffHours = (endMins - startMins) / 60;
    return Math.max(0, diffHours - (cfg.breakHours || 0));
  };

  const totalWeekly = DAYS_OF_WEEK.reduce((sum, { key }) => sum + calculateDayHours(days[key]), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Schedule name is required");
      return;
    }

    const lines: ScheduleLinePayload[] = [];
    DAYS_OF_WEEK.forEach(({ key }) => {
      const cfg = days[key];
      if (cfg.enabled) {
        lines.push({
          dayOfWeek: key,
          startTime: `${cfg.startTime}:00`,
          endTime: `${cfg.endTime}:00`,
          breakHours: cfg.breakHours,
        });
      }
    });

    if (lines.length === 0) {
      setError("At least one working day must be enabled");
      return;
    }

    const payload: CreateSchedulePayload = { name: name.trim(), type, lines };

    setSubmitting(true);
    setError(null);
    try {
      const res = schedule ? await scheduleService.update(schedule.id, payload) : await scheduleService.create(payload);
      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save schedule";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-teal-700" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-stone-900">
              {schedule ? "Edit Working Schedule" : "New Working Schedule"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-stone-600">Schedule Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard 40h (Mon-Fri)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-600">Schedule Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "STANDARD" | "SHIFT" | "FLEXIBLE")}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="STANDARD">Standard</option>
                <option value="SHIFT">Shift</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
          </div>

          <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800">Weekly Schedule Lines</span>
              <span className="text-xs font-medium text-teal-700">Total: {totalWeekly.toFixed(1)} hrs/week</span>
            </div>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map(({ key, label }) => {
                const cfg = days[key];
                const dayHrs = calculateDayHours(cfg);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-2 rounded-xl text-xs transition-colors border ${
                      cfg.enabled ? "bg-white border-stone-200" : "bg-stone-100/50 border-transparent opacity-60"
                    }`}
                  >
                    <label className="flex items-center gap-2 w-16 cursor-pointer font-medium text-stone-800">
                      <input
                        type="checkbox"
                        checked={cfg.enabled}
                        onChange={(e) => setDays((prev) => ({ ...prev, [key]: { ...prev[key], enabled: e.target.checked } }))}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      {label}
                    </label>

                    {cfg.enabled ? (
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                          <input
                            type="time"
                            value={cfg.startTime}
                            onChange={(e) => setDays((prev) => ({ ...prev, [key]: { ...prev[key], startTime: e.target.value } }))}
                            className="px-2 py-1 text-xs rounded-lg border border-stone-200 bg-white"
                          />
                          <span className="text-stone-400">to</span>
                          <input
                            type="time"
                            value={cfg.endTime}
                            onChange={(e) => setDays((prev) => ({ ...prev, [key]: { ...prev[key], endTime: e.target.value } }))}
                            className="px-2 py-1 text-xs rounded-lg border border-stone-200 bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-stone-500">Break:</span>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={cfg.breakHours}
                            onChange={(e) => setDays((prev) => ({ ...prev, [key]: { ...prev[key], breakHours: Number(e.target.value) } }))}
                            className="w-14 px-2 py-1 text-xs rounded-lg border border-stone-200 bg-white"
                          />
                          <span className="text-[11px] text-stone-500">h</span>
                        </div>
                        <span className="ml-auto font-semibold text-stone-700 text-[11px]">{dayHrs.toFixed(1)}h</span>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-xs italic">Off day</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
