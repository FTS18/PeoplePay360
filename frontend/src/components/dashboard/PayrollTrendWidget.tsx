"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { formatCompactCurrency, formatCurrency } from "@/utils/format";

interface PayrollTrend {
  yearMonth: string;
  totalNetSalary: number;
  payslipCount: number;
}

interface ApiMonthlyTrend {
  yearMonth?: string;
  periodStart?: string;
  totalNet?: number;
  totalNetSalary?: number;
  payslipCount?: number;
}

interface PayrollTrendWidgetProps {
  sinceDate?: string;
}

function formatMonthLabel(ym: string) {
  if (!ym) return "";
  const parts = ym.split("-");
  if (parts.length === 2) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return monthNames[monthIdx];
    }
  }
  return ym;
}

function formatFullMonth(ym: string) {
  if (!ym) return "";
  const parts = ym.split("-");
  if (parts.length === 2) {
    const fullMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${fullMonths[monthIdx]} ${parts[0]}`;
    }
  }
  return ym;
}

function formatBarAmount(val: number): string {
  if (!val) return "₹0";
  const abs = Math.abs(val);
  if (abs >= 10000000) {
    return `₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `₹${(abs / 1000).toFixed(1)}k`;
  }
  return `₹${abs}`;
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
      .get<ApiMonthlyTrend[]>(url)
      .then(async (data) => {
        if (!isMounted) return;
        let activeData = data;
        if ((!activeData || activeData.length === 0) && sinceDate) {
          try {
            activeData = await apiClient.get<ApiMonthlyTrend[]>("/dashboard/monthly-trends");
          } catch {}
        }
        if (activeData && activeData.length > 0) {
          const mapped: PayrollTrend[] = activeData.map((t) => {
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
  const totalDisbursed = trends.reduce((acc, t) => acc + Number(t.totalNetSalary || 0), 0);
  const avgMonthly = trends.length > 0 ? totalDisbursed / trends.length : 0;
  const ceiling = maxSalary > 0 ? maxSalary * 1.15 : 1000;

  return (
    <div className="bg-white/95 dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm backdrop-blur-md h-full flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner shrink-0">
            <TrendingUp className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Monthly Net Disbursement Trends</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Historical compensation outflow and settlement cycles</p>
          </div>
        </div>
        {mounted && !loading && trends.length > 0 && (
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-[var(--foreground)] tabular-nums block" suppressHydrationWarning>
              {formatCompactCurrency(avgMonthly)}
            </span>
            <span className="text-[10px] text-[var(--muted-foreground)] font-medium">Monthly Avg</span>
          </div>
        )}
      </div>

      {(!mounted || loading) ? (
        <div className="flex-1 min-h-[250px] pt-4 flex flex-col justify-between animate-pulse">
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-3 pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="h-2.5 w-8 bg-[var(--muted)] dark:bg-stone-800 rounded" />
                <div className="w-full max-w-[44px] bg-[var(--muted)] dark:bg-stone-800 rounded-xl flex-1 max-h-[200px]" />
                <div className="h-2.5 w-6 bg-[var(--muted)] dark:bg-stone-800 rounded" />
              </div>
            ))}
          </div>
          <div className="h-4 w-full bg-[var(--muted)] dark:bg-stone-800 rounded mt-2" />
        </div>
      ) : trends.length === 0 ? (
        <div className="flex-1 min-h-[250px] flex flex-col items-center justify-center text-xs text-[var(--muted-foreground)] gap-2">
          <TrendingUp className="w-8 h-8 text-[var(--muted-foreground)]/40" strokeWidth={1.5} />
          <span>No historical disbursement records found.</span>
        </div>
      ) : (
        <div className="flex-1 min-h-[250px] w-full flex flex-col justify-between pt-4">
          {/* Chart Plot Coordinates with Background Reference Rules */}
          <div className="relative w-full flex-1 min-h-[190px] flex flex-col justify-end">
            {/* Subtle horizontal guideline rules strictly bounded to bar track area */}
            <div className="absolute inset-x-0 bottom-7 top-7 flex flex-col justify-between pointer-events-none opacity-25 z-0">
              <div className="border-b border-dashed border-[var(--border)] w-full" />
              <div className="border-b border-dashed border-[var(--border)] w-full" />
              <div className="border-b border-dashed border-[var(--border)] w-full" />
              <div className="border-b border-[var(--border)] w-full" />
            </div>

            {/* Columns & Bars */}
            <div className="relative z-10 w-full h-full flex items-end justify-between gap-1.5 sm:gap-2.5 md:gap-3">
              {trends.map((item, idx) => {
                const salary = Number(item.totalNetSalary || 0);
                const heightPercent = Math.max(Math.round((salary / ceiling) * 100), 12);
                const isLatest = idx === trends.length - 1;

                return (
                  <div
                    key={item.yearMonth}
                    className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 bg-[var(--popover)] text-[var(--popover-foreground)] text-[10px] rounded-lg px-2.5 py-1.5 shadow-apple-md border border-[var(--border)] whitespace-nowrap">
                      <div className="font-bold text-[var(--foreground)]">{formatCurrency(salary)}</div>
                      <div className="text-[9px] text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                        <span>{formatFullMonth(item.yearMonth)}</span>
                        <span>•</span>
                        <span>{item.payslipCount} payslips</span>
                      </div>
                    </div>

                    {/* Value Above Bar */}
                    <span
                      className="text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] opacity-90 group-hover:opacity-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tabular-nums mb-1.5 whitespace-nowrap text-center"
                      suppressHydrationWarning
                    >
                      {formatBarAmount(salary)}
                    </span>

                    {/* Bar Track & Fill */}
                    <div className="w-full max-w-[42px] sm:max-w-[48px] flex-1 flex items-end bg-muted/20 dark:bg-stone-800/30 rounded-xl p-1 border border-[var(--border-subtle)] group-hover:border-teal-500/40 transition-all duration-200">
                      <div
                        className={`w-full rounded-lg transition-all duration-300 shadow-xs ${
                          isLatest
                            ? "bg-teal-600 dark:bg-teal-500 group-hover:bg-teal-500"
                            : "bg-teal-600/90 dark:bg-teal-500/90 group-hover:bg-teal-500"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Clean Month Label */}
                    <span className="text-[10px] sm:text-[11px] font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors uppercase tracking-tight mt-2 text-center w-full truncate">
                      {formatMonthLabel(item.yearMonth)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Summary Footer */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--muted-foreground)]">
            <span className="font-medium">
              Cycle: {formatMonthLabel(trends[0]?.yearMonth)} – {formatMonthLabel(trends[trends.length - 1]?.yearMonth)}
            </span>
            <span className="tabular-nums font-semibold text-[var(--foreground)]" suppressHydrationWarning>
              {formatCompactCurrency(totalDisbursed)} Total Disbursed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

