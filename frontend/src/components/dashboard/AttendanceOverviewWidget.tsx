"use client";

import React from "react";
import { UserCheck, Clock, UserX, AlertCircle } from "lucide-react";

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
    { label: "Present", count: presentCount, color: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" },
    { label: "Late", count: lateCount, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    { label: "Absent", count: absentCount, color: "bg-red-500", text: "text-red-600 dark:text-red-400" },
    { label: "Overtime", count: overtimeCount, color: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  ];

  const maxVal = Math.max(...stats.map((s) => s.count), 50);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-foreground">Attendance Overview</h3>
        <p className="text-xs text-muted-foreground">Source: Attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
        {/* Bar Chart matching Wireframe 6 */}
        <div className="h-36 flex items-end justify-between gap-3 px-2 pt-2 pb-1 border-b border-border">
          {stats.map((s) => {
            const pct = Math.min(100, Math.round((s.count / maxVal) * 100));
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[11px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                  {s.count}
                </span>
                <div className="w-full max-w-[28px] bg-muted/50 rounded-t-lg overflow-hidden h-full flex items-end">
                  <div
                    className={`${s.color} w-full rounded-t-lg transition-all duration-500`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground truncate">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Side Metrics List */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground">Missing check-ins</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{missingCheckInsCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground">Manual attendance edits</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{manualEditsCount}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground">Attendance coverage</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{coverageRatio}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
