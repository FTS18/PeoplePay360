"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Employee } from "@/types";
import { apiClient, ApiError } from "@/services/apiClient";
import { scheduleService } from "@/services/scheduleService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/common/Modal";

const employeeSchema = z.object({
  employeeCode: z.string().min(1, "Employee Code is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  jobPosition: z.string().min(1, "Job Position is required"),
  bankAccountNumber: z.string().optional(),
  bankIdentifierCode: z.string().optional(),
  identificationNumber: z.string().optional(),
  workingScheduleId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]).default("ACTIVE"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (emp: Employee) => void;
  initialData?: Employee | null;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-card py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-medium transition-all";
const errorInputClass = "border-red-500 focus:ring-red-500/20";

export function EmployeeModal({ isOpen, onClose, onSaved, initialData }: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeCode: initialData?.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      department: initialData?.department || "Sales",
      jobPosition: initialData?.jobPosition || "",
      bankAccountNumber: initialData?.bankAccountNumber || "",
      bankIdentifierCode: initialData?.bankIdentifierCode || "",
      identificationNumber: initialData?.identificationNumber || "",
      workingScheduleId: initialData?.workingScheduleId || "",
      status: initialData?.status || "ACTIVE",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setGlobalError(null);
      reset({
        employeeCode: initialData?.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        department: initialData?.department || "Sales",
        jobPosition: initialData?.jobPosition || "",
        bankAccountNumber: initialData?.bankAccountNumber || "",
        bankIdentifierCode: initialData?.bankIdentifierCode || "",
        identificationNumber: initialData?.identificationNumber || "",
        workingScheduleId: initialData?.workingScheduleId || "",
        status: initialData?.status || "ACTIVE",
      });

      apiClient.get<string[]>("/employees/departments").then((depts) => {
        const defaults = ["Engineering", "Sales", "Product & Design", "Human Resources", "Finance"];
        const combined = Array.from(new Set([...defaults, ...(Array.isArray(depts) ? depts : [])]));
        setDepartments(combined);
      }).catch(() => {
        setDepartments(["Engineering", "Sales", "Product & Design", "Human Resources", "Finance"]);
      });

      scheduleService.getAll().then((scheds) => {
        if (scheds && Array.isArray(scheds)) setSchedules(scheds);
      }).catch(() => {});
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: EmployeeFormValues) => {
    setLoading(true);
    setGlobalError(null);
    try {
      if (initialData?.id) {
        const res = await apiClient.put<Employee>(`/employees/${initialData.id}`, data);
        onSaved(res);
        onClose();
      } else {
        const createPayload = {
          ...data,
          employeeCode: data.employeeCode,
          password: "DefaultPassword@123",
          role: "EMPLOYEE",
          joiningDate: new Date().toISOString().slice(0, 10),
        };
        const res = await apiClient.post<Employee>("/employees", createPayload);
        onSaved(res);
        onClose();
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 400 && err.data) {
        let hasFieldErrors = false;
        if (err.data.validationErrors && typeof err.data.validationErrors === 'object') {
          Object.entries(err.data.validationErrors).forEach(([field, message]) => {
            setError(field as keyof EmployeeFormValues, { type: "server", message: message as string });
            hasFieldErrors = true;
          });
        }
        if (!hasFieldErrors) {
          setGlobalError(err.message || "An error occurred");
        }
      } else {
        setGlobalError(err?.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Employee Profile" : "Register New Employee"}
      subtitle="Workforce identity, organizational assignment, and banking"
      maxWidth="xl"
    >
      {globalError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>{globalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {/* Basic Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Identity &amp; Contact
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Code *</label>
              <input
                type="text"
                {...register("employeeCode")}
                className={`${inputClass} ${errors.employeeCode ? errorInputClass : ""}`}
              />
              {errors.employeeCode && <p className="text-[10px] text-red-500 mt-1">{errors.employeeCode.message}</p>}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">First Name *</label>
              <input
                type="text"
                {...register("firstName")}
                className={`${inputClass} ${errors.firstName ? errorInputClass : ""}`}
              />
              {errors.firstName && <p className="text-[10px] text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Last Name *</label>
              <input
                type="text"
                {...register("lastName")}
                className={`${inputClass} ${errors.lastName ? errorInputClass : ""}`}
              />
              {errors.lastName && <p className="text-[10px] text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Email *</label>
              <input
                type="email"
                {...register("email")}
                className={`${inputClass} ${errors.email ? errorInputClass : ""}`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Phone</label>
              <input
                type="text"
                {...register("phone")}
                className={inputClass}
              />
              {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-3 pt-2 border-t border-border/80">
          <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Job &amp; Schedule
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Department *</label>
              <select
                {...register("department")}
                className={`${inputClass} ${errors.department ? errorInputClass : ""}`}
              >
                {departments.length > 0 ? (
                  departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))
                ) : (
                  <>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Design">Product &amp; Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </>
                )}
              </select>
              {errors.department && <p className="text-[10px] text-red-500 mt-1">{errors.department.message}</p>}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Job Position *</label>
              <input
                type="text"
                {...register("jobPosition")}
                className={`${inputClass} ${errors.jobPosition ? errorInputClass : ""}`}
              />
              {errors.jobPosition && <p className="text-[10px] text-red-500 mt-1">{errors.jobPosition.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Working Schedule</label>
              <select
                {...register("workingScheduleId")}
                className={inputClass}
              >
                <option value="">-- Select Schedule --</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.weeklyHours || 40}h)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Employment Status</label>
              <select
                {...register("status")}
                className={inputClass}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="TERMINATED">TERMINATED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banking */}
        <div className="space-y-3 pt-2 border-t border-border/80">
          <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Financial &amp; Banking
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Bank Account No.</label>
              <input
                type="text"
                {...register("bankAccountNumber")}
                className={inputClass}
              />
              {errors.bankAccountNumber && <p className="text-[10px] text-red-500 mt-1">{errors.bankAccountNumber.message}</p>}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">IFSC / Routing Code</label>
              <input
                type="text"
                {...register("bankIdentifierCode")}
                className={inputClass}
              />
              {errors.bankIdentifierCode && <p className="text-[10px] text-red-500 mt-1">{errors.bankIdentifierCode.message}</p>}
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Tax ID / PAN</label>
              <input
                type="text"
                {...register("identificationNumber")}
                className={inputClass}
              />
              {errors.identificationNumber && <p className="text-[10px] text-red-500 mt-1">{errors.identificationNumber.message}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-border/80 pt-4 flex items-center justify-end gap-2.5">
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
            Save Profile
          </button>
        </div>
      </form>
    </Modal>
  );
}
