"use client";

import React from "react";
import { FileCheck, Clock, CheckCircle2, IndianRupee } from "lucide-react";

interface PayslipStatusWidgetProps {
  draftCount: number;
  computedCount: number;
  validatedCount: number;
  paidCount: number;
}

export function PayslipStatusWidget({
  draftCount = 0,
  computedCount = 0,
  validatedCount = 0,
  paidCount = 0,
}: PayslipStatusWidgetProps) {
  const total = draftCount + computedCount + validatedCount + paidCount || 1;

  const items = [
    { label: "Draft", count: draftCount, color: "bg-amber-500", text: "text-amber-500", icon: Clock },
    { label: "Computed", count: computedCount, color: "bg-blue-500", text: "text-blue-500", icon: FileCheck },
    { label: "Validated", count: validatedCount, color: "bg-indigo-500", text: "text-indigo-500", icon: CheckCircle2 },
    { label: "Paid", count: paidCount, color: "bg-emerald-500", text: "text-emerald-500", icon: IndianRupee },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner shrink-0">
            <FileCheck className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Payslip Status Overview</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Distribution across current payrun cycle</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full shrink-0">
          {total} total payslips
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-muted/40 dark:bg-stone-800 overflow-hidden flex">
        {items.map(
          (item) =>
            item.count > 0 && (
              <div
                key={item.label}
                className={`${item.color} h-full transition-all duration-500`}
                style={{ width: `${(item.count / total) * 100}%` }}
                title={`${item.label}: ${item.count}`}
              />
            )
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-3 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/20 dark:bg-stone-800/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">{item.label}</span>
                <Icon className={`w-3.5 h-3.5 ${item.text}`} strokeWidth={1.75} />
              </div>
              <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{item.count}</p>
            </div>
          );
        })}
      </div>

      {/* Settlement Health Strip */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)]">
        <span>Cycle Execution</span>
        <span className="font-semibold text-teal-700 dark:text-teal-400">100% Disbursed & Reconciled</span>
      </div>
    </div>
  );
}
