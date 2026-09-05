import React from "react";
import { Role } from "@/types";

const ROLE_META: Record<Role, { label: string; color: string }> = {
  ADMIN: { label: "Admin", color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25" },
  HR_MANAGER: { label: "HR Manager", color: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25" },
  HR_PAYROLL_MANAGER: { label: "Payroll Mgr", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25" },
  HR_PAYROLL_USER: { label: "Payroll User", color: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/25" },
  EMPLOYEE: { label: "Employee", color: "bg-stone-500/15 text-stone-600 dark:text-stone-400 border-stone-500/25" },
};

export function RoleBadge({ role }: { role?: Role }) {
  if (!role) return <span className="text-muted-foreground text-[11px]">—</span>;
  const meta = ROLE_META[role] ?? { label: role, color: "bg-muted text-muted-foreground border-border" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}>
      {meta.label}
    </span>
  );
}
