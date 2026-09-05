import React from "react";
import Link from "next/link";
import { Mail, Phone, ChevronRight } from "lucide-react";
import { Employee } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const initials = `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-card p-5 shadow-apple-sm hover:shadow-apple-md transition-all hover:border-stone-300 dark:hover:border-stone-700 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] dark:bg-stone-800 border border-[var(--border)] dark:border-stone-700/80 text-xs font-bold text-foreground shadow-2xs">
              {initials}
            </div>
            <div>
              <Link
                href={ROUTES.EMPLOYEES.DETAIL(employee.id)}
                className="text-sm font-semibold text-foreground hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
              >
                {employee.firstName} {employee.lastName}
              </Link>
              <p className="text-xs text-muted-foreground">{employee.jobPosition}</p>
            </div>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <div className="mt-4 space-y-2 border-t border-stone-200/70 dark:border-stone-800/80 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between text-[11px]">
            <span>Code</span>
            <span className="font-semibold text-foreground tabular-nums">{employee.employeeCode}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Department</span>
            <span className="font-medium text-foreground">{employee.department}</span>
          </div>
          <div className="flex items-center gap-2 truncate text-[11px]">
            <Mail className="h-3 w-3 shrink-0 text-stone-400" strokeWidth={1.5} />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-[11px]">
              <Phone className="h-3 w-3 shrink-0 text-stone-400" strokeWidth={1.5} />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-200/70 dark:border-stone-800/80 flex items-center justify-end">
        <Link
          href={ROUTES.EMPLOYEES.DETAIL(employee.id)}
          className="apple-press inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
        >
          View Profile
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

