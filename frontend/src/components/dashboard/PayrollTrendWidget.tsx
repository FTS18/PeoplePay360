"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { formatCompactCurrency } from "@/utils/format";

interface PayrollTrend {
  yearMonth: string;
  totalNetSalary: number;
  payslipCount: number;
}

interface PayrollTrendWidgetProps {
  sinceDate?: string;
}

export function PayrollTrendWidget({ sinceDate }: PayrollTrendWidgetProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [trends, setTrends] = useState<PayrollTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setMounted(true);
    setLoading(true);
    const url = sinceDate ? `/dashboard/monthly-trends?sinceDate=${sinceDate}` : "/dashboard/monthly-trends";
    apiClient
      .get<any[]>(url)
      .then(async (data) => {
        if (!isMounted) return;
        let activeData = data;
        if ((!activeData || activeData.length === 0) && sinceDate) {
          try {
            activeData = await apiClient.get<any[]>("/dashboard/monthly-trends");
          } catch {}
        }
        if (activeData && activeData.length > 0) {
          const mapped: PayrollTrend[] = activeData.map((t: any) => {
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
        } else {
          setTrends([]);
        }
      })
      .catch(() => {
        if (isMounted) setTrends([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sinceDate]);

  const maxSalary = Math.max(...trends.map((t) => Number(t.totalNetSalary || 0)), 1000);

  return (
    <div className="bg-white/95 dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm backdrop-blur-md space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Monthly Net Disbursement Trends</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Historical compensation outflow and settlement cycles</p>
          </div>
        </div>
      </div>

      {(!mounted || loading) ? (
        <div className="pt-2 flex items-end justify-between gap-3 h-36 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-[var(--muted)] dark:bg-stone-800 rounded-lg h-24" />
              <div className="h-2.5 w-10 bg-[var(--muted)] dark:bg-stone-800 rounded" />
            </div>
          ))}
        </div>
      ) : trends.length === 0 ? (
        <div className="h-36 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
          No historical disbursement records found.
        </div>
      ) : (
        <div className={`pt-2 flex items-end gap-4 h-36 ${trends.length <= 2 ? "justify-start" : "justify-between"}`}>
          {trends.map((item) => {
            const salary = Number(item.totalNetSalary || 0);
            const heightPercent = maxSalary > 0 ? Math.max(Math.round((salary / maxSalary) * 100), 16) : 16;
            return (
              <div key={item.yearMonth} className="w-16 max-w-[72px] flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  className="text-[10px] font-semibold text-[var(--foreground)] opacity-90 group-hover:opacity-100 transition-opacity tabular-nums"
                  suppressHydrationWarning
                >
                  {formatCompactCurrency(salary)}
                </div>
                <div className="w-full bg-[var(--muted)] dark:bg-stone-800/80 rounded-xl h-24 flex items-end p-1 overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="w-full bg-teal-600 dark:bg-teal-500 group-hover:bg-teal-500 dark:group-hover:bg-teal-400 rounded-lg transition-all duration-300 shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-tight">
                  {item.yearMonth}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
