"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, ShieldAlert } from "lucide-react";

export interface PayrollWarning {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW" | string;
  link: string;
}

interface PayrollWarningsWidgetProps {
  warnings: PayrollWarning[];
}

export function PayrollWarningsWidget({ warnings = [] }: PayrollWarningsWidgetProps) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
          <h3 className="text-sm font-bold text-foreground">Payroll Warnings & Attention Items</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          No critical payroll warnings or missing data issues detected. System operational.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 p-5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" strokeWidth={1.5} />
          <h3 className="text-sm font-bold text-foreground">Items Requiring Attention</h3>
        </div>
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          {warnings.length} warning{warnings.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        {warnings.map((warn) => (
          <Link
            key={warn.id}
            href={warn.link}
            className="group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-amber-500/40 transition-all cursor-pointer shadow-2xs"
          >
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {warn.title}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    warn.severity === "HIGH"
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {warn.severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{warn.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 shrink-0" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </div>
  );
}
