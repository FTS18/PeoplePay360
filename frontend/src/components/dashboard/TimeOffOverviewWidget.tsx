"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight, Clock, CheckCircle2, XCircle } from "lucide-react";

interface TimeOffOverviewWidgetProps {
  pendingCount?: number;
  approvedCount?: number;
  refusedCount?: number;
}

export function TimeOffOverviewWidget({
  pendingCount = 2,
  approvedCount = 14,
  refusedCount = 1,
}: TimeOffOverviewWidgetProps) {
  const totalRequests = pendingCount + approvedCount + refusedCount || 1;
  const approvalRate = Math.round((approvedCount / totalRequests) * 100);

  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20 flex items-center justify-center shadow-inner shrink-0">
            <CalendarDays className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Time Off Overview</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Active leave requests & allocations</p>
          </div>
        </div>
        <Link
          href="/time-off/requests"
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0"
        >
          View All <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        </Link>
      </div>

      {/* 3 Status Pipeline Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{pendingCount}</p>
        </div>

        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{approvedCount}</p>
        </div>

        <div className="p-3 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/30 dark:bg-stone-800/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">Refused</span>
            <XCircle className="w-3.5 h-3.5 text-[var(--muted-foreground)]" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{refusedCount}</p>
        </div>
      </div>

      {/* Leave Type Allocation Breakdown (Fills the vertical space) */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--foreground)]">Leave Type Distribution</span>
          <span className="text-[11px] text-[var(--muted-foreground)] tabular-nums">{approvalRate}% Approved</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted/40 dark:bg-stone-800 flex overflow-hidden">
          <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: "62%" }} title="Paid Leave: 62%" />
          <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: "24%" }} title="Sick Leave: 24%" />
          <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: "14%" }} title="Casual / Other: 14%" />
        </div>

        {/* Legend Chips */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
            <span className="truncate">Paid (62%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <span className="truncate">Sick (24%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span className="truncate">Casual (14%)</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)]">
        <span>Policy: Statutory Calendar</span>
        <span className="font-medium text-teal-600 dark:text-teal-400">Zero Payroll Deductions</span>
      </div>
    </div>
  );
}
