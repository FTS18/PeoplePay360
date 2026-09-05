"use client";

import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { formatCurrency } from "@/utils/format";

interface DepartmentCost {
  departmentName: string;
  employeeCount: number;
  totalCost: number;
}

interface DepartmentCostWidgetProps {
  sinceDate?: string;
  selectedDepartment?: string;
}

export function DepartmentCostWidget({ sinceDate, selectedDepartment }: DepartmentCostWidgetProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [costs, setCosts] = useState<DepartmentCost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setMounted(true);
    setLoading(true);
    const url = sinceDate ? `/dashboard/department-costs?sinceDate=${sinceDate}` : "/dashboard/department-costs";
    apiClient
      .get<any[]>(url)
      .then(async (data) => {
        if (!isMounted) return;
        let activeData = data;
        if ((!activeData || activeData.length === 0) && sinceDate) {
          try {
            activeData = await apiClient.get<any[]>("/dashboard/department-costs");
          } catch {}
        }
        if (activeData && activeData.length > 0) {
          const mapped: DepartmentCost[] = activeData.map((d: any) => ({
            departmentName: d.department || d.departmentName || "General",
            employeeCount: d.headcount ?? d.employeeCount ?? 0,
            totalCost: Number(d.totalNet ?? d.totalCost ?? 0),
          }));
          setCosts(mapped);
        } else {
          setCosts([]);
        }
      })
      .catch(() => {
        if (isMounted) setCosts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sinceDate]);

  const filteredCosts = selectedDepartment
    ? costs.filter((c) => c.departmentName.toLowerCase().includes(selectedDepartment.toLowerCase()))
    : costs;

  const totalExpenditure = filteredCosts.reduce((acc, c) => acc + Number(c.totalCost || 0), 0);

  const isPending = !mounted || loading;

  return (
    <div className="bg-white/95 dark:bg-[var(--card)] rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm backdrop-blur-md space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 dark:bg-teal-500/20 flex items-center justify-center shadow-inner">
            <Building2 className="w-4.5 h-4.5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Salary Expenditure by Department</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">Live operational cost distribution across workforce units</p>
          </div>
        </div>
        {isPending ? (
          <div className="h-4 w-16 bg-[var(--muted)] dark:bg-stone-800 rounded animate-pulse" />
        ) : (
          <span className="text-xs font-bold text-[var(--foreground)] tabular-nums tabular-nums" suppressHydrationWarning>
            {formatCurrency(totalExpenditure)}
          </span>
        )}
      </div>

      {isPending ? (
        <div className="space-y-3 pt-1 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-[var(--muted)] dark:bg-stone-800 rounded" />
                <div className="h-3 w-16 bg-[var(--muted)] dark:bg-stone-800 rounded" />
              </div>
              <div className="h-2 w-full bg-[var(--muted)] dark:bg-stone-800 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredCosts.length === 0 ? (
        <div className="py-6 text-center text-xs text-[var(--muted-foreground)]">
          No validated payroll disbursement records found for this period.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {filteredCosts.map((dept) => {
            const cost = Number(dept.totalCost || 0);
            const percent = totalExpenditure > 0 ? Math.round((cost / totalExpenditure) * 100) : 0;
            return (
              <div key={dept.departmentName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{dept.departmentName}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-medium">
                      ({dept.employeeCount} staff)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums tabular-nums">
                    <span className="font-bold text-[var(--foreground)]" suppressHydrationWarning>
                      {formatCurrency(cost)}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] w-7 text-right">{percent}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-[var(--muted)] dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
