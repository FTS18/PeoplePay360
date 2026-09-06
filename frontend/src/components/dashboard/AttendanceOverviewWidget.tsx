"use client";

import React from "react";
import { UserCheck, AlertTriangle, Edit3, ShieldCheck } from "lucide-react";

interface AttendanceOverviewWidgetProps {
  presentCount?: number;
  lateCount?: number;
  absentCount?: number;
  overtimeCount?: number;
  missingCheckInsCount?: number;
  manualEditsCount?: number;
  coverageRatio?: string;
}

export function AttendanceOverviewWidget({
  presentCount = 94,
  lateCount = 18,
  absentCount = 9,
  overtimeCount = 22,
  missingCheckInsCount = 5,
  manualEditsCount = 7,
  coverageRatio = "94%",
}: AttendanceOverviewWidgetProps) {
  const stats = [
    { label: "Present", count: presentCount, color: "bg-teal-500", track: "bg-teal-500/10", text: "text-teal-600 dark:text-teal-400" },
    { label: "Late", count: lateCount, color: "bg-blue-500", track: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    { label: "Absent", count: absentCount, color: "bg-rose-500", track: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
    { label: "Overtime", count: overtimeCount, color: "bg-indigo-500", track: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  ];

  const maxVal = Math.max(...stats.map((s) => s.count), 50);

  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md h-full flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner shrink-0">
            <UserCheck className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Attendance Overview</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Daily presence & anomaly distribution</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full shrink-0">
          Live Status
        </span>
      </div>

      {/* Bar Chart Visualization */}
      <div className="flex-1 min-h-[140px] flex flex-col justify-end pt-2 pb-1">
        <div className="w-full flex items-end justify-between gap-3 px-1">
          {stats.map((s) => {
            const pct = Math.max(Math.min(100, Math.round((s.count / maxVal) * 100)), 8);
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center justify-end h-full group">
                <span className="text-[11px] font-bold text-[var(--foreground)] tabular-nums mb-1.5 opacity-90 group-hover:opacity-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {s.count}
                </span>
                <div className="w-full max-w-[38px] h-24 bg-muted/30 dark:bg-stone-800/40 rounded-xl p-1 flex items-end border border-[var(--border-subtle)] group-hover:border-teal-500/30 transition-all">
                  <div
                    className={`${s.color} w-full rounded-lg transition-all duration-500 shadow-xs`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors mt-1.5 uppercase tracking-tight text-center">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Anomaly Metrics */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/20 dark:bg-stone-800/20">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={1.75} />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] truncate">Missing Check-ins</span>
          </div>
          <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0 px-2 py-0.5 rounded-md bg-amber-500/10 text-xs">
            {missingCheckInsCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/20 dark:bg-stone-800/20">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Edit3 className="w-3.5 h-3.5 text-blue-500 shrink-0" strokeWidth={1.75} />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] truncate">Manual Attendance Edits</span>
          </div>
          <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums shrink-0 px-2 py-0.5 rounded-md bg-blue-500/10 text-xs">
            {manualEditsCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/20 dark:bg-stone-800/20">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={1.75} />
            <span className="text-[11px] font-medium text-[var(--muted-foreground)] truncate">Attendance Coverage</span>
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/10 text-xs">
            {coverageRatio}
          </span>
        </div>
      </div>
    </div>
  );
}
