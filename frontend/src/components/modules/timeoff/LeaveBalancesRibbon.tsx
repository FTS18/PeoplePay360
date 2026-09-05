"use client";

import React from "react";
import { Calendar, HeartPulse, Clock, Sparkles } from "lucide-react";
import { TimeOffBalance } from "@/types";

interface LeaveBalancesRibbonProps {
  balances: TimeOffBalance[];
  loading?: boolean;
}

export function LeaveBalancesRibbon({ balances, loading }: LeaveBalancesRibbonProps) {
  const getIcon = (code: string) => {
    switch (code) {
      case "PTO":
        return <Calendar className="w-4 h-4 text-teal-600" strokeWidth={1.5} />;
      case "SICK":
        return <HeartPulse className="w-4 h-4 text-rose-600" strokeWidth={1.5} />;
      default:
        return <Clock className="w-4 h-4 text-[var(--muted-foreground)]" strokeWidth={1.5} />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/90 dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 animate-pulse shadow-[var(--shadow-apple-sm)]">
            <div className="h-4 bg-[var(--muted)] rounded-md w-24 mb-3" />
            <div className="h-8 bg-[var(--muted)] rounded-md w-16 mb-2" />
            <div className="h-3 bg-[var(--muted)] rounded-md w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {balances.map((b) => {
        const isUnlimited = Number(b.availableBalance) >= 900;
        return (
          <div
            key={b.timeOffTypeId}
            className="bg-white/95 dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-apple-sm)] hover:shadow-[var(--shadow-apple-md)] transition-all apple-specular backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
              <span className="font-semibold text-[var(--foreground)]">{b.timeOffTypeName}</span>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-inner"
                style={{ backgroundColor: `${b.colorCode || "#0284C7"}18` }}
              >
                {getIcon(b.code)}
              </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
                {isUnlimited ? "Unlimited" : b.availableBalance}
              </span>
              {!isUnlimited && (
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {b.unit.toLowerCase()} available
                </span>
              )}
            </div>

            <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="tabular-nums text-[11px]">Code: {b.code}</span>
              <span className="text-[var(--muted-foreground)] opacity-70">Payroll: {b.code === "UNPAID" ? "Deducted" : "Paid"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
