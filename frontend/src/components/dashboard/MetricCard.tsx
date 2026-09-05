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
        return "bg-[oklch(22%_0.04_195)] text-[oklch(85%_0.14_195)]";
      case "gold":
        return "bg-[oklch(92%_0.08_85)] text-[oklch(40%_0.12_85)]";
      case "green":
        return "bg-[oklch(92%_0.08_150)] text-[oklch(35%_0.12_150)]";
      case "charcoal":
      default:
        return "bg-[oklch(93%_0.005_240)] text-[oklch(20%_0.02_240)]";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-[oklch(92%_0.005_240)] bg-white p-6 shadow-xs transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(50%_0.02_240)]">
          {title}
        </span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", getIconStyles())}>
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        {loading ? (
          <div className="h-7 w-24 bg-stone-100 rounded-lg animate-pulse" />
        ) : (
          <div className="text-2xl font-bold tracking-tight text-[oklch(20%_0.02_240)] tabular-nums">
            {value}
          </div>
        )}
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-[oklch(45%_0.15_150)]" : "text-[oklch(50%_0.18_30)]"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                trend.positive ? "bg-[oklch(60%_0.16_150)]" : "bg-[oklch(60%_0.18_30)]"
              )}
            />
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-[oklch(50%_0.02_240)]">{subtitle}</p>
      )}
    </div>
  );
}
