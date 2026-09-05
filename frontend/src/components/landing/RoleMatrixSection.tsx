"use client";

import { useState } from "react";

type RoleTab = "EMPLOYEE" | "HR_MANAGER" | "PAYROLL_USER" | "PAYROLL_MANAGER" | "ADMIN";

const ROLES: { id: RoleTab; label: string; title: string; description: string }[] = [
  {
    id: "EMPLOYEE",
    label: "Employee",
    title: "Standard Employee Access",
    description:
      "Can view personal profile details, punch shift attendance, apply for leave, and download personal payslip PDFs. Zero access to administrative or payroll controls.",
  },
  {
    id: "HR_MANAGER",
    label: "HR Manager",
    title: "HR Manager Operations",
    description:
      "Full management of Employees, Contracts, Schedules, and Time-Off approvals. Restricted from computing or validating payruns.",
  },
  {
    id: "PAYROLL_USER",
    label: "HR Payroll User",
    title: "HR Payroll User",
    description:
      "All HR Manager permissions plus Create/Read/Update access to draft Payruns and Payslips. Read-only inspection of Salary Structures and Rules.",
  },
  {
    id: "PAYROLL_MANAGER",
    label: "HR Payroll Manager",
    title: "HR Payroll Manager",
    description:
      "Full control over Payruns, Payslips, Salary Structures, and Rules. Full authority to validate payruns, mark as paid, and trigger bulk email delivery.",
  },
  {
    id: "ADMIN",
    label: "Admin",
    title: "Full Platform Administrator",
    description:
      "Unrestricted access to all modules, system configurations, user role assignments, permission overrides, and platform audit logs.",
  },
];

export function RoleMatrixSection() {
  const [activeRole, setActiveRole] = useState<RoleTab>("PAYROLL_MANAGER");
  const activeRoleData = ROLES.find((r) => r.id === activeRole)!;

  return (
    <section id="roles" className="py-20 sm:py-24 bg-white text-stone-900 border-b border-stone-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-stone-900 font-anton">
            Role-Based{" "}
            <span className="font-serif italic font-normal text-teal-700 capitalize tracking-normal text-3xl sm:text-5xl">
              Access Control
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Enforces clear permission boundaries across employees, HR managers, payroll specialists, and admins.
          </p>
        </div>

        <div className="rounded-3xl p-6 sm:p-8 border border-stone-200/80 bg-stone-50/50 shadow-2xs">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`apple-press px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  activeRole === role.id
                    ? "bg-stone-900 text-white shadow-2xs font-bold"
                    : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div className="text-xs space-y-4 max-w-2xl mx-auto text-center">
            <div className="space-y-2 animate-in fade-in">
              <div className="font-bold text-sm text-stone-900">{activeRoleData.title}</div>
              <p className="text-stone-600">{activeRoleData.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
