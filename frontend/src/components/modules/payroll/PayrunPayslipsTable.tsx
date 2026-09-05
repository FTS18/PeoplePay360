"use client";

import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { Payslip } from "@/types";
import { payrollService } from "@/services/payrollService";

interface PayrunPayslipsTableProps {
  payslips: Payslip[];
  onSelectPayslip: (payslip: Payslip) => void;
}

export function PayrunPayslipsTable({ payslips, onSelectPayslip }: PayrunPayslipsTableProps) {
  const formatMoney = (val?: number) => {
    const num = val != null ? Number(val) : 0;
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50/75 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4 text-center">Days Worked</th>
              <th className="py-3.5 px-4 text-right">Basic Wage</th>
              <th className="py-3.5 px-4 text-right">Gross</th>
              <th className="py-3.5 px-4 text-right">Deductions</th>
              <th className="py-3.5 px-4 text-right">Net Payable</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-stone-400">
                  No payslips generated yet. Run the computation engine above to compile payslips.
                </td>
              </tr>
            ) : (
              payslips.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-800">{p.employeeName || "Employee"}</div>
                    <div className="text-xs text-stone-400">{p.employeeCode || "EMP"}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-stone-600">
                    {p.workedDays || 0}d
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-stone-700">
                    {formatMoney(p.basicWage)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-stone-800">
                    {formatMoney(p.grossSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-amber-700">
                    -{formatMoney(p.totalDeductions)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-teal-950">
                    {formatMoney(p.netSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onSelectPayslip(p)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-teal-800 hover:bg-teal-50 border border-stone-200 transition-colors cursor-pointer"
                        title="View Detailed Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                      <a
                        href={payrollService.getPdfUrl(p.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-stone-600 hover:text-teal-800 hover:bg-teal-50 border border-stone-200 transition-colors cursor-pointer"
                        title="Download PDF Payslip"
                      >
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
