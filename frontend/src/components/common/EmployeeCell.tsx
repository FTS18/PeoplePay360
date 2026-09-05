import React from "react";
import { cn } from "@/utils/cn";

interface EmployeeCellProps {
  name?: string | null;
  subtext?: string | null;
  avatarSize?: "sm" | "md";
  className?: string;
}

export function EmployeeCell({
  name = "Employee",
  subtext,
  avatarSize = "md",
  className,
}: EmployeeCellProps) {
  const safeName = name?.trim() || "Employee";
  const initials = safeName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = avatarSize === "sm" ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[10px]";

  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      <div
        className={cn(
          sizeClass,
          "rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/25 flex items-center justify-center font-bold shrink-0"
        )}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-[var(--foreground)] truncate text-xs">{safeName}</div>
        {subtext && (
          <div className="text-[11px] text-[var(--muted-foreground)] tabular-nums truncate">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
