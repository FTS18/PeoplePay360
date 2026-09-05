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
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {buttons.map((btn) => {
        const Icon = btn.icon;
        const displayValue = btn.count ?? btn.value ?? 0;
        return (
          <Link
            key={btn.label}
            href={btn.href}
            className={cn(
              "flex items-center gap-2.5 px-3.5 py-2 rounded-md border border-(--border) bg-(--card)",
              "hover:bg-(--secondary)/70 hover:border-slate-300 transition-all shadow-sm",
              "text-left group",
              btn.active && "border-slate-400 bg-(--secondary)/40"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-(--secondary) text-(--muted-foreground) group-hover:text-(--foreground) transition-colors">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold tabular-nums leading-none text-(--foreground)">
                {displayValue}
              </p>
              <p className="text-[11px] font-medium text-(--muted-foreground) leading-none mt-1">
                {btn.label}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
