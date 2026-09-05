"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";

interface DeptOverviewItem {
  department: string;
  headcount: number;
  monthlySalary: string;
}

export function DepartmentOverviewWidget() {
  const [items, setItems] = useState<DeptOverviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDepartmentOverview() {
      try {
        const res = await apiClient.get<any[]>("/dashboard/department-costs");
        if (Array.isArray(res) && res.length > 0) {
          setItems(
            res.map((d: any) => ({
              department: d.department || d.departmentName || "General",
              headcount: d.headcount ?? d.employeeCount ?? 0,
              monthlySalary: d.totalNet != null
                ? `₹ ${(Number(d.totalNet) / 100000).toFixed(1)}L`
                : "₹ 0.0L",
            }))
          );
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartmentOverview();
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-foreground">Department Overview</h3>
        <p className="text-xs text-muted-foreground">Source: Employee + Contract + Payslip totals</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
            <tr>
              <th className="px-3.5 py-2">Department</th>
              <th className="px-3 py-2 text-center">Headcount</th>
              <th className="px-3 py-2 text-right">Monthly Salary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground text-xs">Loading department metrics...</td>
              </tr>
            ) : (
              items.map((d) => (
                <tr key={d.department} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3.5 py-2.5 font-semibold text-foreground">{d.department}</td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground tabular-nums">{d.headcount}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400 tabular-nums">{d.monthlySalary}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
