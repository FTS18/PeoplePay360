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
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
          <span>Total Gross Run</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-stone-900">
          {formatCurrency(payrun.totalBasic != null ? Number(payrun.totalBasic) + Number(payrun.totalAllowances || 0) : 0)}
        </div>
        <div className="text-xs text-stone-400 mt-1">Earnings & Allowances</div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
          <span>Total Statutory Deductions</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-stone-900">
          {formatCurrency(payrun.totalDeductions)}
        </div>
        <div className="text-xs text-stone-400 mt-1">PF (12%) & Tax (10%)</div>
      </div>

      <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-xs bg-linear-to-br from-teal-50/50 to-white">
        <div className="flex items-center justify-between text-xs text-teal-800 font-semibold mb-2">
          <span>Net Disbursed</span>
          <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center">
            <Wallet className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-teal-950">
          {formatCurrency(payrun.totalNet)}
        </div>
        <div className="text-xs text-teal-700 mt-1 font-medium">Bank Clearing Amount</div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
          <span>Employees in Run</span>
          <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-4 h-4" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-stone-900">
          {payrun.payslipsCount || 0}
        </div>
        <div className="text-xs text-stone-400 mt-1">Active Computed Contracts</div>
      </div>
    </div>
  );
}
