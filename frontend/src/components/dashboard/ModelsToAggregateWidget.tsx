"use client";

import React from "react";
import { Database } from "lucide-react";

export function ModelsToAggregateWidget() {
  return (
    <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/10 p-5 shadow-2xs space-y-3 h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300">
        <Database className="w-4 h-4 text-teal-500" strokeWidth={1.5} />
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider">Models to Aggregate</h3>
          <p className="text-[11px] text-muted-foreground italic">This is the actual challenge behind the dashboard.</p>
        </div>
      </div>

      <ul className="space-y-2 text-xs text-foreground/90">
        <li className="flex items-start gap-1.5">
          <span className="text-teal-500 font-bold">•</span>
          <span><strong>Employees / Departments</strong> &rarr; headcount, ownership, grouping</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="text-teal-500 font-bold">•</span>
          <span><strong>Contracts</strong> &rarr; wage, schedule, active employees</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="text-teal-500 font-bold">•</span>
          <span><strong>Payruns / Payslips</strong> &rarr; salary totals, paid vs pending, trend data</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="text-teal-500 font-bold">•</span>
          <span><strong>Attendance</strong> &rarr; presence, absences, late entries, overtime</span>
        </li>
        <li className="flex items-start gap-1.5">
          <span className="text-teal-500 font-bold">•</span>
          <span><strong>Time Off Requests / Allocations</strong> &rarr; leave taken and leave balances</span>
        </li>
      </ul>
    </div>
  );
}
