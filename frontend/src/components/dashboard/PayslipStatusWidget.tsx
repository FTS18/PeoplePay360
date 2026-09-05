"use client";

import React from "react";
import { FileCheck, Clock, CheckCircle2, DollarSign } from "lucide-react";

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
    { label: "Paid", count: paidCount, color: "bg-emerald-500", text: "text-emerald-500", icon: DollarSign },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Payslip Status Overview</h3>
          <p className="text-xs text-muted-foreground">Distribution across current payrun cycle</p>
        </div>
        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full">
          {total} total payslips
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-3 rounded-xl border border-border bg-muted/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
                <Icon className={`w-3.5 h-3.5 ${item.text}`} strokeWidth={1.5} />
              </div>
              <p className="text-lg font-bold text-foreground">{item.count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
