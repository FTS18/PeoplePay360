"use client";

import React from "react";
import { DollarSign, TrendingDown, Users, Wallet } from "lucide-react";
import { Payrun } from "@/types";

interface PayrunSummaryCardsProps {
  payrun: Payrun;
}

export function PayrunSummaryCards({ payrun }: PayrunSummaryCardsProps) {
  const formatCurrency = (val?: number) => {
    const num = val != null ? Number(val) : 0;
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Run */}
      <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all text-foreground apple-specular">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Total Gross Run</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <DollarSign className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {formatCurrency(payrun.totalBasic != null ? Number(payrun.totalBasic) + Number(payrun.totalAllowances || 0) : 0)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Earnings & Allowances</div>
      </div>

      {/* Statutory Deductions */}
      <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all text-foreground apple-specular">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Total Statutory Deductions</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {formatCurrency(payrun.totalDeductions)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">PF (12%) & Tax (10%)</div>
      </div>

      {/* Net Disbursed */}
      <div className="bg-card rounded-2xl border border-teal-500/30 dark:border-teal-500/40 p-5 shadow-apple-sm hover:shadow-apple-md transition-all text-foreground apple-specular bg-linear-to-br from-teal-500/5 to-card">
        <div className="flex items-center justify-between text-xs text-teal-700 dark:text-teal-400 font-semibold mb-2">
          <span>Net Disbursed</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-600">
            <Wallet className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {formatCurrency(payrun.totalNet)}
        </div>
        <div className="text-xs text-teal-700 dark:text-teal-400 mt-1 font-medium">Bank Clearing Amount</div>
      </div>

      {/* Employees in Run */}
      <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all text-foreground apple-specular">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Employees in Run</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--muted)] dark:bg-stone-800 text-muted-foreground border border-stone-200 dark:border-stone-700">
            <Users className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {payrun.payslipsCount || 0}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Active Computed Contracts</div>
      </div>
    </div>
  );
}
