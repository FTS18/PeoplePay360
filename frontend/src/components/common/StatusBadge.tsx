import React from "react";
import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status?.toUpperCase() || "UNKNOWN";

  const getVariant = () => {
    switch (normalized) {
      case "ACTIVE":
      case "RUNNING":
      case "APPROVED":
      case "PAID":
      case "PRESENT":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20";
      case "COMPUTED":
      case "VALIDATED":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20";
      case "DRAFT":
      case "CONFIRM":
      case "PENDING":
        return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
      case "HALF_DAY":
      case "LATE":
      case "WARNING":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "EXPIRED":
      case "CANCELLED":
      case "REFUSED":
      case "EXCEPTION":
      case "ABSENT":
      case "INACTIVE":
      case "TERMINATED":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
      case "BASIC":
      case "ALLOWANCE":
      case "GROSS":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20";
      case "NET":
        return "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 font-bold";
      case "DEDUCTION":
        return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    }
  };

  const label = normalized === "CONFIRM" ? "PENDING" : normalized.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-wide",
        getVariant(),
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
