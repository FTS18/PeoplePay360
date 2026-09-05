"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, BarChart2 } from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface PayrollTrend {
  yearMonth: string;
  totalNetSalary: number;
  payslipCount: number;
}

const FALLBACK_TRENDS: PayrollTrend[] = [
  { yearMonth: "2026-05", totalNetSalary: 48000, payslipCount: 7 },
  { yearMonth: "2026-06", totalNetSalary: 51200, payslipCount: 7 },
  { yearMonth: "2026-07", totalNetSalary: 54200, payslipCount: 8 },
  { yearMonth: "2026-08", totalNetSalary: 54200, payslipCount: 8 },
  { yearMonth: "2026-09", totalNetSalary: 5400, payslipCount: 2 },
];

interface PayrollTrendWidgetProps {
  sinceDate?: string;
}

export function PayrollTrendWidget({ sinceDate }: PayrollTrendWidgetProps) {
  const [trends, setTrends] = useState<PayrollTrend[]>(FALLBACK_TRENDS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const url = sinceDate ? `/dashboard/monthly-trends?sinceDate=${sinceDate}` : "/dashboard/monthly-trends";
    apiClient
      .get<any[]>(url)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: PayrollTrend[] = data.map((t: any) => {
            let ym = t.yearMonth;
            if (!ym && t.periodStart) {
              ym = String(t.periodStart).slice(0, 7);
            }
            return {
              yearMonth: ym || "Recent",
              totalNetSalary: Number(t.totalNet ?? t.totalNetSalary ?? 0),
              payslipCount: Number(t.payslipCount ?? 0),
            };
          });
          setTrends(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sinceDate]);

  const maxSalary = Math.max(...trends.map((t) => Number(t.totalNetSalary || 0)), 60000);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Monthly Net Disbursement Trends</h3>
            <p className="text-[11px] text-stone-500">Historical compensation outflow and settlement cycles</p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-end justify-between gap-3 h-36">
        {trends.map((item) => {
          const salary = Number(item.totalNetSalary || 0);
          const heightPercent = maxSalary > 0 ? Math.max(Math.round((salary / maxSalary) * 100), 12) : 15;
          const monthLabel = item.yearMonth.split("-")[1] || item.yearMonth;
          return (
            <div key={item.yearMonth} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="text-[10px] font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                ${salary >= 1000 ? `${(salary / 1000).toFixed(1)}k` : salary}
              </div>
              <div className="w-full bg-stone-100 rounded-lg h-24 flex items-end p-0.5 overflow-hidden">
                <div
                  className="w-full bg-[oklch(28%_0.06_195)] group-hover:bg-[oklch(24%_0.06_195)] rounded-md transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-tight">
                {item.yearMonth}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
