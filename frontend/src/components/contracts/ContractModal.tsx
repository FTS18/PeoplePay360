"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, FileText } from "lucide-react";
import { Contract, Employee, SalaryStructure } from "@/types";
import { apiClient, ApiError } from "@/services/apiClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const contractSchema = z.object({
  contractReference: z.string().min(1, "Contract Reference is required *"),
  employeeId: z.string().min(1, "Employee is required *"),
  salaryStructureId: z.string().min(1, "Salary Structure is required *"),
  workingScheduleId: z.string().optional(),
  startDate: z.string().min(1, "Start Date is required *"),
  endDate: z.string().optional(),
  wage: z.number().min(0.01, "Wage must be greater than 0"),
  status: z.enum(["RUNNING", "DRAFT", "EXPIRED", "CANCELLED"]).default("RUNNING"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSaved: (contract: Contract) => void;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-300/90 dark:border-stone-700/90 bg-stone-50/90 dark:bg-stone-900/60 py-2 px-3 text-xs text-foreground placeholder:text-stone-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]";
const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function ContractModal({ isOpen, onClose, employees, onSaved }: ContractModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const generateRef = () => `CNT/2026/${String(Math.floor(1000 + Math.random() * 9000))}`;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractReference: generateRef(),
      employeeId: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      wage: 6500,
      salaryStructureId: "",
      workingScheduleId: "",
      status: "RUNNING",
    },
  });

  const employeeId = watch("employeeId");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setGlobalError(null);
      reset({
        contractReference: generateRef(),
        employeeId: employees[0]?.id || "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: "",
        wage: 6500,
        salaryStructureId: structures[0]?.id || "",
        workingScheduleId: schedules[0]?.id || "",
        status: "RUNNING",
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
  }, [isOpen, employees, structures, schedules, reset, onClose]);

  useEffect(() => {
    apiClient
      .get<SalaryStructure[]>("/payroll/structures")
      .then((res) => {
        if (res && res.length > 0) {
          setStructures(res);
          setValue("salaryStructureId", res[0].id);
        }
      })
      .catch(() => {});

    apiClient
      .get<any[]>("/schedules")
      .then((res) => {
        if (res && res.length > 0) {
          setSchedules(res);
          setValue("workingScheduleId", res[0].id);
        }
      })
      .catch(() => {});
  }, [setValue]);

  if (!isOpen || !mounted) return null;

  const onSubmit = async (data: ContractFormValues) => {
    setLoading(true);
    setGlobalError(null);

    const emp = employees.find((x) => x.id === data.employeeId) || employees[0];

    const payload = {
      reference: data.contractReference,
      employeeId: data.employeeId || emp?.id,
      department: emp?.department || "General",
      jobPosition: emp?.jobPosition || "Staff",
      salaryStructureId: data.salaryStructureId,
      workingScheduleId: data.workingScheduleId || undefined,
      wage: data.wage,
      startDate: data.startDate,
      endDate: data.endDate || null,
      status: data.status,
    };

    try {
      const res = await apiClient.post<Contract>("/contracts", payload);
      onSaved(res);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof ContractFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (!hasFieldErrors) {
           setGlobalError(err.message || "An error occurred");
        }
      } else if (err instanceof ApiError && err.status === 409) {
         setGlobalError(err.message || "Conflict: Concurrent running contract detected for this employee in the specified period.");
      } else {
        setGlobalError(err?.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="w-full max-w-lg rounded-2xl apple-glass-modal apple-specular text-foreground shadow-apple-modal my-auto overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-card/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <FileText className="h-4.5 w-4.5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Create Employment Contract</h2>
              <p className="text-[11px] text-muted-foreground">Define terms, salary structure, and active validity window</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="apple-press rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {globalError && (
          <div className="m-6 mb-0 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div>
              <span className="font-semibold">Operation Failed:</span>
              <p className="mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div className="rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-stone-50/50 dark:bg-stone-900/40 p-4 space-y-3.5">
            <div>
              <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Contract Reference</label>
              <input
                type="text"
                {...register("contractReference")}
                className={`${inputClass} ${errors.contractReference ? errorInputClass : ""}`}
              />
              {errors.contractReference && <p className="text-[10px] text-red-500 mt-1">{errors.contractReference.message}</p>}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Employee</label>
              <select
                {...register("employeeId")}
                className={`${inputClass} ${errors.employeeId ? errorInputClass : ""}`}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{errors.employeeId.message}</p>}
            </div>

            {structures.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Salary Structure *</label>
                <select
                  {...register("salaryStructureId")}
                  className={`${inputClass} ${errors.salaryStructureId ? errorInputClass : ""}`}
                >
                  {structures.map((str) => (
                    <option key={str.id} value={str.id}>
                      {str.name} ({str.code})
                    </option>
                  ))}
                </select>
                {errors.salaryStructureId && <p className="text-[10px] text-red-500 mt-1">{errors.salaryStructureId.message}</p>}
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Working Schedule</label>
              <select
                {...register("workingScheduleId")}
                className={inputClass}
              >
                <option value="">-- Select Schedule --</option>
                {schedules.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.name} ({sch.weeklyHours || 40}h/week)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Start Date</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className={`${inputClass} ${errors.startDate ? errorInputClass : ""}`}
                />
                {errors.startDate && <p className="text-[10px] text-red-500 mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">End Date (Optional)</label>
                <input
                  type="date"
                  {...register("endDate")}
                  className={`${inputClass} ${errors.endDate ? errorInputClass : ""}`}
                />
                {errors.endDate && <p className="text-[10px] text-red-500 mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Monthly Wage (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("wage", { valueAsNumber: true })}
                  className={`${inputClass} ${errors.wage ? errorInputClass : ""}`}
                />
                {errors.wage && <p className="text-[10px] text-red-500 mt-1">{errors.wage.message}</p>}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">Status</label>
                <select
                  {...register("status")}
                  className={`${inputClass} ${errors.status ? errorInputClass : ""}`}
                >
                  <option value="RUNNING">RUNNING</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                {errors.status && <p className="text-[10px] text-red-500 mt-1">{errors.status.message}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-border/80 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="apple-press rounded-xl border border-stone-300 dark:border-stone-700 bg-[var(--muted)] dark:bg-stone-800/80 px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="apple-press flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-2 text-xs font-semibold text-white transition-all shadow-apple-sm cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />}
              Confirm Contract
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
