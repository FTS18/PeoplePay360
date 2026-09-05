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
    <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-xs transition-all hover:border-(--border)/80 hover:shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--secondary) text-xs font-bold text-(--foreground)">
              {initials}
            </div>
            <div>
              <Link
                href={ROUTES.EMPLOYEES.DETAIL(employee.id)}
                className="text-sm font-semibold text-(--foreground) hover:underline"
              >
                {employee.firstName} {employee.lastName}
              </Link>
              <p className="text-xs text-(--muted-foreground)">{employee.jobPosition}</p>
            </div>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <div className="mt-4 space-y-2 border-t border-(--border) pt-3 text-xs text-(--muted-foreground)">
          <div className="flex items-center justify-between text-[11px]">
            <span>Code</span>
            <span className="font-semibold text-(--foreground)">{employee.employeeCode}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Department</span>
            <span className="font-medium text-(--foreground)">{employee.department}</span>
          </div>
          <div className="flex items-center gap-2 truncate text-[11px]">
            <Mail className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{employee.workEmail}</span>
          </div>
          {employee.workPhone && (
            <div className="flex items-center gap-2 text-[11px]">
              <Phone className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              <span>{employee.workPhone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-(--border) flex items-center justify-end">
        <Link
          href={ROUTES.EMPLOYEES.DETAIL(employee.id)}
          className="inline-flex items-center gap-1 text-xs font-medium text-(--primary) hover:underline"
        >
          View Profile
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
