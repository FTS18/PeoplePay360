import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "teal" | "gold" | "green" | "charcoal";
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "teal",
  trend,
  className,
  loading = false,
}: MetricCardProps) {
  const getIconStyles = () => {
    switch (accent) {
      case "teal":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20";
      case "gold":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20";
      case "green":
        return "bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20";
      case "charcoal":
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all duration-200 apple-specular backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {title}
        </span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shadow-inner", getIconStyles())}>
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between">
        {loading ? (
          <div className="h-7 w-24 bg-[var(--muted)] dark:bg-stone-800 rounded-lg animate-pulse" />
        ) : (
          <div className="text-2xl font-bold tracking-tight text-[var(--foreground)] tabular-nums tabular-nums" suppressHydrationWarning>
            {value}
          </div>
        )}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border tracking-tight",
              trend.positive
                ? "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                trend.positive ? "bg-teal-500" : "bg-rose-500"
              )}
            />
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{subtitle}</p>
      )}
    </div>
  );
}
