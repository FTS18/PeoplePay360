"use client";

import React from "react";
import Link from "next/link";
import { PlayCircle, CalendarCheck, Clock, FileSignature, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface QuickActionsWidgetProps {
  pendingLeaves?: number;
}

export function QuickActionsWidget({ pendingLeaves = 2 }: QuickActionsWidgetProps) {
  const actions = [
    {
      label: "Process New Payrun",
      subtext: "Compute & validate monthly batch",
      href: "/payroll/payruns",
      icon: PlayCircle,
      badge: "Pipeline",
      color: "text-teal-600 dark:text-teal-400 bg-teal-500/10",
    },
    {
      label: "Review Leave Requests",
      subtext: "Approve or refuse employee leaves",
      href: "/time-off/requests",
      icon: CalendarCheck,
      badge: `${pendingLeaves} Pending`,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      label: "Manual Attendance Overrides",
      subtext: "Audit check-ins and miss logs",
      href: "/attendance",
      icon: Clock,
      badge: "Audit",
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      label: "Manage Employee Contracts",
      subtext: "Salary structures & wage terms",
      href: "/contracts",
      icon: FileSignature,
      badge: "260 Active",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner shrink-0">
            <Zap className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Quick Actions</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Frequent payroll & operational shortcuts</p>
          </div>
        </div>
      </div>

      {/* Action Links List */}
      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className="group flex items-center justify-between p-3 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-muted/20 dark:bg-stone-800/20 hover:border-teal-500/40 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[var(--foreground)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {act.label}
                  </div>
                  <div className="text-[11px] text-[var(--muted-foreground)]">
                    {act.subtext}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" strokeWidth={1.75} />
            </Link>
          );
        })}
      </div>

      {/* System Operational Badge */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.75} />
          <span>Statutory Compliance: Active</span>
        </div>
        <span className="font-medium text-teal-700 dark:text-teal-400">PostgreSQL Live</span>
      </div>
    </div>
  );
}
