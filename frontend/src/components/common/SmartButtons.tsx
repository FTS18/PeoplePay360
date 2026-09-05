import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SmartButtonConfig {
  label: string;
  count?: number | string;
  value?: number | string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}

interface SmartButtonsProps {
  buttons: SmartButtonConfig[];
  className?: string;
}

export function SmartButtons({ buttons, className }: SmartButtonsProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5", className)}>
      {buttons.map((btn) => {
        const Icon = btn.icon;
        const displayValue = btn.count ?? btn.value ?? 0;
        return (
          <Link
            key={btn.label}
            href={btn.href}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2 rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)]",
              "hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-apple-sm transition-all apple-press shadow-xs",
              "text-left group",
              btn.active && "border-teal-500/50 bg-teal-50/50 dark:bg-teal-950/20"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--muted)] dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/40 transition-colors">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold tabular-nums leading-none text-[var(--foreground)] tabular-nums">
                {displayValue}
              </p>
              <p className="text-[11px] font-medium text-[var(--muted-foreground)] leading-none mt-1">
                {btn.label}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
