"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, Loader2, AlertCircle, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient, ApiError } from "@/services/apiClient";
import { Employee, Role } from "@/types";

import { Modal } from "@/components/common/Modal";

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "EMPLOYEE", label: "Employee", description: "Standard access — own profile, payslips, leave requests only" },
  { value: "HR_MANAGER", label: "HR Manager", description: "Manage employees, contracts, attendance, and leave approvals" },
  { value: "HR_PAYROLL_USER", label: "HR Payroll User", description: "View payroll reports and payslips; cannot compute or validate payruns" },
  { value: "HR_PAYROLL_MANAGER", label: "HR Payroll Manager", description: "Full payroll access — compute, validate, and mark payruns as paid" },
  { value: "ADMIN", label: "Admin", description: "Unrestricted access to all modules and user management" },
];

const schema = z.object({
  role: z.enum(["EMPLOYEE", "HR_MANAGER", "HR_PAYROLL_USER", "HR_PAYROLL_MANAGER", "ADMIN"] as const),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export function UserAccessModal({ isOpen, onClose, onSaved, employee }: Props) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "EMPLOYEE", active: true },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (isOpen && employee) {
      setGlobalError(null);
      reset({
        role: (employee.role as Role) ?? "EMPLOYEE",
        active: employee.status === "ACTIVE",
      });
    }
  }, [isOpen, employee, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!employee) return;
    setLoading(true);
    setGlobalError(null);
    try {
      await apiClient.patch(`/employees/${employee.id}/access`, {
        role: data.role,
        active: data.active,
      });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) {
        setGlobalError(err.message ?? "Failed to update access");
      } else {
        setGlobalError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? `Manage Access — ${employee.firstName} ${employee.lastName}` : "Add User"}
      subtitle={employee?.email ?? "Assign role and account status"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {globalError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{globalError}</span>
          </div>
        )}

        {/* Role Radio Group */}
        <div>
          <label className="text-[11px] font-bold tracking-wide text-stone-500 dark:text-stone-400 uppercase mb-2 block">
            System Role
          </label>
          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedRole === opt.value
                    ? "border-teal-500/60 bg-teal-500/10"
                    : "border-border hover:border-border/80 hover:bg-muted/30"
                }`}
              >
                <input
                  type="radio"
                  value={opt.value}
                  {...register("role")}
                  className="mt-0.5 accent-teal-600"
                />
                <div>
                  <div className={`text-xs font-semibold ${selectedRole === opt.value ? "text-teal-700 dark:text-teal-400" : "text-foreground"}`}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.role && <p className="text-[10px] text-red-500 mt-1">{errors.role.message}</p>}
        </div>

        {/* Account Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
          <div>
            <div className="text-xs font-semibold text-foreground">Account Active</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Inactive accounts cannot log in to the system
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register("active")} className="sr-only peer" />
            <div className="w-9 h-5 bg-stone-300 dark:bg-stone-700 peer-checked:bg-teal-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-teal-500/40" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="apple-press rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="apple-press flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />}
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
            Save Access
          </button>
        </div>
      </form>
    </Modal>
  );
}
