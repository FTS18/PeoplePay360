"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, ArrowRight, ShieldCheck, Users } from "lucide-react";

interface WorkforceCapacityWidgetProps {
  totalEmployees?: number;
}

export function WorkforceCapacityWidget({ totalEmployees = 260 }: WorkforceCapacityWidgetProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner shrink-0">
            <Briefcase className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Workforce & Contracts</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Contract status & workforce allocation</p>
          </div>
        </div>
        <Link
          href="/contracts"
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0"
        >
          Contracts <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
        </Link>
      </div>

      {/* 3 Contract Lifecycle Metrics */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">Running</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">{totalEmployees}</p>
        </div>

        <div className="p-3 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/30 dark:bg-stone-800/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">Draft</span>
            <Users className="w-3.5 h-3.5 text-[var(--muted-foreground)]" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">0</p>
        </div>

        <div className="p-3 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/30 dark:bg-stone-800/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">Expiring</span>
            <Briefcase className="w-3.5 h-3.5 text-[var(--muted-foreground)]" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-[var(--foreground)] tabular-nums">0</p>
        </div>
      </div>

      {/* Employment Type Distribution */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--foreground)]">Contract Type Breakdown</span>
          <span className="text-[11px] text-[var(--muted-foreground)] tabular-nums">100% Covered</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted/40 dark:bg-stone-800 flex overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: "94%" }} title="Full-Time: 94%" />
          <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: "6%" }} title="Contractor: 6%" />
        </div>

        {/* Legend Chips */}
        <div className="flex items-center justify-between pt-1 text-[10px]">
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-teal-600 shrink-0" />
            <span>Full-Time (245)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <span>Contractors (15)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-stone-400 shrink-0" />
            <span>Probation (0)</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)]">
        <span>Working Schedules</span>
        <span className="font-medium text-teal-600 dark:text-teal-400">Standard 40h Assigned</span>
      </div>
    </div>
  );
}
