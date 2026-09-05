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
        return <Calendar className="w-4 h-4 text-sky-600" strokeWidth={1.5} />;
      case "SICK":
        return <HeartPulse className="w-4 h-4 text-rose-600" strokeWidth={1.5} />;
      default:
        return <Clock className="w-4 h-4 text-stone-600" strokeWidth={1.5} />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200/80 p-5 animate-pulse">
            <div className="h-4 bg-stone-100 rounded-md w-24 mb-3" />
            <div className="h-8 bg-stone-100 rounded-md w-16 mb-2" />
            <div className="h-3 bg-stone-100 rounded-md w-32" />
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
            className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold text-stone-700">{b.timeOffTypeName}</span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${b.colorCode || "#0284C7"}15` }}
              >
                {getIcon(b.code)}
              </div>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold tracking-tight text-stone-900">
                {isUnlimited ? "Unlimited" : b.availableBalance}
              </span>
              {!isUnlimited && (
                <span className="text-xs font-medium text-stone-400">
                  {b.unit.toLowerCase()} available
                </span>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Code: {b.code}</span>
              <span className="text-stone-400">Payroll: {b.code === "UNPAID" ? "Deducted" : "Paid"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
