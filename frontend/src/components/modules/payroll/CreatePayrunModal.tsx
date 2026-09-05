"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { SalaryStructure, Payrun, Employee } from "@/types";
import { payrollService } from "@/services/payrollService";
import { apiClient, ApiError } from "@/services/apiClient";
import { CreatePayrunStaffSelector } from "@/components/modules/payroll/CreatePayrunStaffSelector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const payrunSchema = z.object({
  name: z.string().min(1, "Payrun name is required"),
  salaryStructureId: z.string().min(1, "Salary structure is required"),
  periodStart: z.string().min(1, "Start date is required"),
  periodEnd: z.string().min(1, "End date is required"),
}).refine((data) => {
  return new Date(data.periodEnd) >= new Date(data.periodStart);
}, {
  message: "End date cannot be before start date",
  path: ["periodEnd"],
});

type PayrunFormValues = z.infer<typeof payrunSchema>;

interface CreatePayrunModalProps {
  isOpen: boolean;
  structures: SalaryStructure[];
  onClose: () => void;
  onSuccess: (payrun: Payrun) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--muted)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30 transition-all";
const errorInputClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20";

export function CreatePayrunModal({ isOpen, structures, onClose, onSuccess }: CreatePayrunModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm<PayrunFormValues>({
    resolver: zodResolver(payrunSchema),
    defaultValues: {
      name: `Payrun ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      salaryStructureId: "",
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
      periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1);
      setGlobalError(null);
      reset({
        name: `Payrun ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        salaryStructureId: structures[0]?.id || "",
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
        periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
      });

      apiClient
        .get<any>("/employees?size=100")
        .then((res) => {
          const list: Employee[] = Array.isArray(res) ? res : res?.content ?? [];
          const active = list.filter((e) => !e.status || e.status.toUpperCase() === "ACTIVE");
          const finalEmps = active.length > 0 ? active : list;
          setEmployees(finalEmps);
          setSelectedEmpIds(finalEmps.map((e) => e.id));
        })
        .catch(() => {});
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
  }, [isOpen, structures, reset, onClose]);

  if (!isOpen || !mounted) return null;

  const toggleSelectAll = () => {
    setSelectedEmpIds(
      selectedEmpIds.length === employees.length ? [] : employees.map((e) => e.id)
    );
  };

  const toggleEmp = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const onStep1Submit = (data: PayrunFormValues) => {
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (selectedEmpIds.length === 0) {
      setGlobalError("Please select at least one employee for the payrun batch.");
      return;
    }
    setSubmitting(true);
    setGlobalError(null);

    const data = getValues();

    try {
      const created = await payrollService.createDraft({
        name: data.name,
        salaryStructureId: data.salaryStructureId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof PayrunFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (hasFieldErrors) {
          setStep(1); // Go back to show errors
        } else {
           setGlobalError(err.message || "An error occurred");
        }
      } else {
        setGlobalError(err?.message || "Failed to initialize payrun draft");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-apple-modal border border-[var(--border)] dark:border-stone-700/80 bg-white/95 dark:bg-[var(--card)] max-h-[90vh] my-auto overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] dark:border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center shadow-inner">
              <CreditCard className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {step === 1 ? "New Pay Run" : "Select Employee Records"}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {step === 1 ? "Collect payrun scope and salary structure parameters" : "The Payrun is created only after employee selection."}
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
          <div className="mt-3.5 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
             <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
             <span>{globalError}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit(onStep1Submit)} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Pay Structure
              </label>
              <select
                {...register("salaryStructureId")}
                className={`${inputClass} ${errors.salaryStructureId ? errorInputClass : ""} bg-stone-50/90 dark:bg-stone-900/60 border-stone-300/90 dark:border-stone-700/90 cursor-pointer`}
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-stone-900 text-[var(--foreground)]">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              {errors.salaryStructureId && <p className="text-[10px] text-red-500 mt-1">{errors.salaryStructureId.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Payrun Period
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
                      reset({ ...getValues(), periodStart: start, periodEnd: end });
                    }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
                      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);
                      reset({ ...getValues(), periodStart: start, periodEnd: end });
                    }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                  >
                    Next Month
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    {...register("periodStart")}
                    onChange={(e) => {
                      const val = e.target.value;
                      register("periodStart").onChange(e);
                      if (val) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                          const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
                          reset({ ...getValues(), periodStart: val, periodEnd: endOfMonth });
                        }
                      }
                    }}
                    className={`${inputClass} ${errors.periodStart ? errorInputClass : ""} bg-stone-50/90 dark:bg-stone-900/60 border-stone-300/90 dark:border-stone-700/90`}
                  />
                  {errors.periodStart && <p className="text-[10px] text-red-500 mt-1">{errors.periodStart.message}</p>}
                </div>
                <div>
                  <input
                    type="date"
                    {...register("periodEnd")}
                    className={`${inputClass} ${errors.periodEnd ? errorInputClass : ""} bg-stone-50/90 dark:bg-stone-900/60 border-stone-300/90 dark:border-stone-700/90`}
                  />
                  {errors.periodEnd && <p className="text-[10px] text-red-500 mt-1">{errors.periodEnd.message}</p>}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-start items-center gap-3 border-t border-[var(--border)] dark:border-[var(--border-subtle)]">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-900/20 transition-all apple-press cursor-pointer"
              >
                <span>Continue</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-[var(--muted)] dark:hover:bg-stone-800 rounded-xl transition-colors apple-press cursor-pointer"
              >
                Discard
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground/80 italic pt-1">
              Participant note: this popup collects the payrun scope only. Continue should not create the Payrun yet.
            </p>
          </form>
        ) : (
          <CreatePayrunStaffSelector
            employees={employees}
            selectedEmpIds={selectedEmpIds}
            submitting={submitting}
            onToggleEmp={toggleEmp}
            onToggleAll={toggleSelectAll}
            onBack={() => setStep(1)}
            onSubmit={handleFinalSubmit}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
