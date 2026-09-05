"use client";

import React from "react";
import { X, Download, Building2, CheckCircle2, Shield } from "lucide-react";
import { Payslip } from "@/types";
import { payrollService } from "@/services/payrollService";

interface PayslipDetailModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

export function PayslipDetailModal({ payslip, onClose }: PayslipDetailModalProps) {
  if (!payslip) return null;

  const formatMoney = (val?: number) => {
    const num = val != null ? Number(val) : 0;
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const earnings = payslip.lines?.filter(
    (l) => l.category === "BASIC" || l.category === "ALLOWANCE" || l.category === "GROSS"
  ) || [];

  const deductions = payslip.lines?.filter((l) => l.category === "DEDUCTION") || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              Itemized Settlement Slip
            </span>
            <h3 className="text-lg font-bold text-stone-900 mt-0.5">
              {payslip.employeeName || "Employee Payslip"}
            </h3>
            <p className="text-xs text-stone-500">
              Code: {payslip.employeeCode} | Period: {payslip.periodStart} to {payslip.periodEnd}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Overview Row */}
        <div className="grid grid-cols-3 gap-3 my-4 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
          <div>
            <span className="text-stone-500 block">Worked Days</span>
            <span className="font-semibold text-stone-900">{payslip.workedDays} Days</span>
          </div>
          <div>
            <span className="text-stone-500 block">Basic Contract Wage</span>
            <span className="font-semibold text-stone-900">{formatMoney(payslip.basicWage)}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Payment Status</span>
            <span className="font-semibold text-teal-700">{payslip.status}</span>
          </div>
        </div>

        {/* Two-Column Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Earnings */}
          <div className="border border-stone-100 rounded-xl p-3 bg-stone-50/50">
            <h4 className="font-semibold text-stone-700 mb-2 pb-1 border-b border-stone-200">
              Earnings & Allowances
            </h4>
            <div className="space-y-1.5">
              {earnings.length > 0 ? (
                earnings.map((line) => (
                  <div key={line.id} className="flex justify-between items-center text-stone-600">
                    <span>{line.ruleName}</span>
                    <span className="font-medium text-stone-900">{formatMoney(line.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-stone-600">
                  <span>Gross Salary</span>
                  <span className="font-medium text-stone-900">{formatMoney(payslip.grossSalary)}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
              <span>Total Gross</span>
              <span>{formatMoney(payslip.grossSalary)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="border border-stone-100 rounded-xl p-3 bg-stone-50/50">
            <h4 className="font-semibold text-stone-700 mb-2 pb-1 border-b border-stone-200">
              Statutory Deductions
            </h4>
            <div className="space-y-1.5">
              {deductions.length > 0 ? (
                deductions.map((line) => (
                  <div key={line.id} className="flex justify-between items-center text-stone-600">
                    <span>{line.ruleName}</span>
                    <span className="font-medium text-amber-700">-{formatMoney(line.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-stone-600">
                  <span>Standard Deductions</span>
                  <span className="font-medium text-amber-700">-{formatMoney(payslip.totalDeductions)}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-stone-200 flex justify-between font-bold text-amber-800">
              <span>Total Deductions</span>
              <span>-{formatMoney(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight */}
        <div className="mt-4 p-4 rounded-xl bg-teal-950 text-white flex items-center justify-between">
          <div>
            <span className="text-xs text-teal-300 block font-medium">Net Disbursed Payable</span>
            <div className="text-2xl font-bold">{formatMoney(payslip.netSalary)}</div>
          </div>
          <a
            href={payrollService.getPdfUrl(payslip.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
