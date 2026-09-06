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
      <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner shrink-0">
              <ShieldAlert className="w-4.5 h-4.5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Payroll Integrity & Audits</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Continuous statutory & operational guardrails</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full shrink-0">
            All Clear
          </span>
        </div>

        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 dark:bg-stone-800/20 text-[11px]">
            <span className="text-[var(--muted-foreground)]">Statutory & Tax Withholding</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">Reconciled</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 dark:bg-stone-800/20 text-[11px]">
            <span className="text-[var(--muted-foreground)]">Contract Wage Overlaps</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">Zero Detected</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 dark:bg-stone-800/20 text-[11px]">
            <span className="text-[var(--muted-foreground)]">Biometric Attendance Logs</span>
            <span className="font-semibold text-teal-700 dark:text-teal-400">Synchronized</span>
          </div>
        </div>
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
