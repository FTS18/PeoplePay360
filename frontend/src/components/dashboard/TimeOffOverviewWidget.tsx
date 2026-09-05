"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

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
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
          <div>
            <h3 className="text-sm font-bold text-foreground">Time Off Overview</h3>
            <p className="text-xs text-muted-foreground">Active leave requests & allocations</p>
          </div>
        </div>
        <Link
          href="/timeoff/requests"
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          View All <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />
          </div>
          <p className="text-lg font-bold text-foreground">{pendingCount}</p>
        </div>

        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
          </div>
          <p className="text-lg font-bold text-foreground">{approvedCount}</p>
        </div>

        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Refused</span>
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-lg font-bold text-foreground">{refusedCount}</p>
        </div>
      </div>
    </div>
  );
}
