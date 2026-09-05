"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { AttendanceRecord, AttendanceStatus } from "@/types";
import { attendanceService } from "@/services/attendanceService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ApiError } from "@/services/apiClient";

const overrideSchema = z.object({
  status: z.enum(["PRESENT", "LATE", "HALF_DAY", "EXCEPTION", "ABSENT"]),
  workedHours: z.number().min(0).max(24),
  overrideReason: z.string().min(5, "Audit justification reason must be at least 5 characters long for compliance."),
});

type OverrideFormValues = z.infer<typeof overrideSchema>;

interface AttendanceOverrideModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onSaved: (updated: AttendanceRecord) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--muted)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 transition-all";
const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function AttendanceOverrideModal({ record, onClose, onSaved }: AttendanceOverrideModalProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<OverrideFormValues>({
    resolver: zodResolver(overrideSchema),
    defaultValues: {
      status: "PRESENT",
      workedHours: 8.0,
      overrideReason: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (record) {
      document.body.style.overflow = "hidden";
      setGlobalError(null);
      reset({
        status: record.status || "PRESENT",
        workedHours: record.workedHours || 8.0,
        overrideReason: record.overrideReason || "",
      });
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && record) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [record, reset, onClose]);

  if (!record || !mounted) return null;

  const onSubmit = async (data: OverrideFormValues) => {
    setSubmitting(true);
    setGlobalError(null);

    try {
      const updated = await attendanceService.overrideRecord(record.id, {
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        workedHours: data.workedHours,
        status: data.status,
        overrideReason: data.overrideReason,
      });
      onSaved(updated);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof OverrideFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (!hasFieldErrors) {
           setGlobalError(err.message || "An error occurred");
        }
      } else {
        setGlobalError(err?.message || "Failed to update record");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-apple-modal border border-[var(--border)] dark:border-stone-700/80 bg-white/95 dark:bg-[var(--card)] max-h-[90vh] my-auto overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] dark:border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Manual Attendance Override</h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {record.employeeName || "Employee"} • <span className="tabular-nums">{record.date}</span>
              </p>
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
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Status Classification
            </label>
            <select
              {...register("status")}
              className={`${inputClass} ${errors.status ? errorInputClass : ""} bg-stone-50/90 dark:bg-stone-900/60 border border-stone-300/90 dark:border-stone-700/90`}
            >
              <option value="PRESENT" className="bg-white dark:bg-stone-900">PRESENT</option>
              <option value="LATE" className="bg-white dark:bg-stone-900">LATE</option>
              <option value="HALF_DAY" className="bg-white dark:bg-stone-900">HALF_DAY</option>
              <option value="EXCEPTION" className="bg-white dark:bg-stone-900">EXCEPTION</option>
            </select>
            {errors.status && <p className="text-[10px] text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Adjusted Worked Hours
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="24"
              {...register("workedHours", { valueAsNumber: true })}
              className={`${inputClass} ${errors.workedHours ? errorInputClass : ""} tabular-nums`}
            />
            {errors.workedHours && <p className="text-[10px] text-red-500 mt-1">{errors.workedHours.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Audit Justification Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...register("overrideReason")}
              placeholder="E.g., Punch terminal glitch at HQ entrance, verified by supervisor badge log."
              className={`${inputClass} ${errors.overrideReason ? errorInputClass : ""} resize-none bg-stone-50/90 dark:bg-stone-900/60 border border-stone-300/90 dark:border-stone-700/90`}
            />
            {errors.overrideReason && <p className="text-[10px] text-red-500 mt-1">{errors.overrideReason.message}</p>}
          </div>

          <div className="pt-3 flex justify-end items-center gap-2.5 border-t border-[var(--border)] dark:border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="apple-press rounded-xl border border-stone-300 dark:border-stone-700 bg-[var(--muted)] dark:bg-stone-800/80 px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="apple-press flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-semibold text-white transition-all shadow-apple-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Confirm Override
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
