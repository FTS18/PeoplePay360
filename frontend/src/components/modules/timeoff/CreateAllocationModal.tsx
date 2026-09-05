"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CalendarRange, Loader2, AlertCircle } from "lucide-react";
import { apiClient, ApiError } from "@/services/apiClient";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffAllocation, TimeOffType } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const allocationSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  timeOffTypeId: z.string().min(1, "Leave type is required"),
  allocatedUnits: z.number().min(0.5, "Minimum 0.5 units required"),
  validFrom: z.string().min(1, "Valid From is required"),
  validTo: z.string().min(1, "Valid To is required"),
}).refine((data) => {
  return new Date(data.validTo) >= new Date(data.validFrom);
}, {
  message: "Valid To date cannot be before Valid From date",
  path: ["validTo"],
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

interface CreateAllocationModalProps {
  types: TimeOffType[];
  onClose: () => void;
  onSuccess: (allocation: TimeOffAllocation) => void;
}

const inputClass =
  "w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all dark:bg-stone-900/60 dark:border-stone-700/90 dark:text-foreground";
const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function CreateAllocationModal({ types, onClose, onSuccess }: CreateAllocationModalProps) {
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      employeeId: "",
      timeOffTypeId: "",
      allocatedUnits: 1,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    async function loadEmployees() {
      try {
        const res = await apiClient.get<any>("/employees?size=100");
        const content = Array.isArray(res) ? res : res?.content ?? [];
        setEmployees(
          content.map((e: any) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
          }))
        );
      } catch {
        setEmployees([]);
      }
    }
    loadEmployees();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const onSubmit = async (data: AllocationFormValues) => {
    setSubmitting(true);
    setGlobalError(null);
    try {
      const result = await timeoffService.createAllocation(data);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof AllocationFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (!hasFieldErrors) {
           setGlobalError(err.message || "An error occurred");
        }
      } else {
        setGlobalError(err?.message || "Failed to create allocation.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="w-full max-w-md bg-white dark:bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] max-h-[90vh] my-auto overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <CalendarRange className="w-5 h-5 text-teal-700 dark:text-teal-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-foreground">New Leave Allocation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[var(--muted)] dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {globalError && (
          <div className="mx-5 mt-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div>
              <span className="font-semibold">Operation Failed:</span>
              <p className="mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Employee</label>
            <select
              {...register("employeeId")}
              className={`${inputClass} ${errors.employeeId ? errorInputClass : ""}`}
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            {errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{errors.employeeId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Leave Type</label>
            <select
              {...register("timeOffTypeId")}
              className={`${inputClass} ${errors.timeOffTypeId ? errorInputClass : ""}`}
            >
              <option value="">Select leave type...</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
              ))}
            </select>
            {errors.timeOffTypeId && <p className="text-[10px] text-red-500 mt-1">{errors.timeOffTypeId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Allocated Units (days/hours)</label>
            <input
              type="number"
              step={0.5}
              {...register("allocatedUnits", { valueAsNumber: true })}
              className={`${inputClass} ${errors.allocatedUnits ? errorInputClass : ""}`}
            />
            {errors.allocatedUnits && <p className="text-[10px] text-red-500 mt-1">{errors.allocatedUnits.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Valid From</label>
              <input
                type="date"
                {...register("validFrom")}
                className={`${inputClass} ${errors.validFrom ? errorInputClass : ""}`}
              />
              {errors.validFrom && <p className="text-[10px] text-red-500 mt-1">{errors.validFrom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Valid To</label>
              <input
                type="date"
                {...register("validTo")}
                className={`${inputClass} ${errors.validTo ? errorInputClass : ""}`}
              />
              {errors.validTo && <p className="text-[10px] text-red-500 mt-1">{errors.validTo.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="apple-press w-full flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-apple-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Grant Allocation
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
