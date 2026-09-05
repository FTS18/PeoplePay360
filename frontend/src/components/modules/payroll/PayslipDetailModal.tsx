"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Play, Printer } from "lucide-react";
import { Payslip } from "@/types";
import { payrollService } from "@/services/payrollService";
import { formatCurrency } from "@/utils/format";

interface PayslipDetailModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

export function PayslipDetailModal({ payslip, onClose }: PayslipDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!payslip || !mounted) return null;

  const lines = payslip.lines || [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-apple-modal border border-border bg-card max-h-[90vh] my-auto overflow-y-auto space-y-6 text-foreground animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Payslip /</span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                {payslip.employeeName || "Employee"} / {payslip.periodStart ? new Date(payslip.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' }) : "Period"}
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Detailed salary computation for one employee</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(payrollService.getPdfUrl(payslip.id), '_blank')}
              className="apple-press inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
              PRINT PAYSLIP
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors apple-press cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* 2-Column Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="text-muted-foreground font-medium">Employee</span>
              <span className="font-bold text-foreground">{payslip.employeeName}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="text-muted-foreground font-medium">Salary Structure</span>
              <span className="font-semibold text-foreground">{payslip.contractReference || "Regular Salary"}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="text-muted-foreground font-medium">Pay Run</span>
              <span className="font-semibold text-foreground">
                {payslip.periodStart ? new Date(payslip.periodStart).toLocaleString('default', { month: 'long', year: 'numeric' }) : "Monthly Payrun"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="text-muted-foreground font-medium">Period</span>
              <span className="font-semibold text-foreground tabular-nums">{payslip.periodStart} — {payslip.periodEnd}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="text-muted-foreground font-medium">Status</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">Done</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
              <span className="text-muted-foreground font-medium">Worked Days</span>
              <span className="font-bold text-foreground tabular-nums">{payslip.workedDays || 22}</span>
            </div>
          </div>
        </div>

        {/* Salary Computation Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-foreground tracking-tight">Salary Computation</h3>
          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/80 backdrop-blur-md border-b border-border text-[11px] font-semibold text-muted-foreground">
                <tr>
                  <th className="p-2.5">Rule</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Amount</th>
                  <th className="p-2.5 text-right">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {lines.length > 0 ? (
                  lines.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">{l.ruleName}</td>
                      <td className="p-2.5 text-muted-foreground">{l.category}</td>
                      <td className={`p-2.5 text-right tabular-nums font-bold ${
                        l.category === "DEDUCTION" ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      }`}>
                        {l.category === "DEDUCTION" ? `-${formatCurrency(l.amount)}` : formatCurrency(l.amount)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-muted-foreground">{l.ruleCode}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">Basic Salary</td>
                      <td className="p-2.5 text-muted-foreground">Basic</td>
                      <td className="p-2.5 text-right tabular-nums font-bold text-foreground">{formatCurrency(payslip.basicWage)}</td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-muted-foreground">BASIC</td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">Gross Salary</td>
                      <td className="p-2.5 text-muted-foreground">Gross</td>
                      <td className="p-2.5 text-right tabular-nums font-bold text-foreground">{formatCurrency(payslip.grossSalary)}</td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-muted-foreground">GROSS</td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-semibold text-foreground">Provident Fund</td>
                      <td className="p-2.5 text-muted-foreground">Deduction</td>
                      <td className="p-2.5 text-right tabular-nums font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(payslip.totalDeductions)}</td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-muted-foreground font-semibold">PF</td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors bg-teal-500/10">
                      <td className="p-2.5 font-bold text-teal-800 dark:text-teal-300">Net Salary</td>
                      <td className="p-2.5 text-teal-800 dark:text-teal-300 font-semibold">Net</td>
                      <td className="p-2.5 text-right tabular-nums font-extrabold text-teal-700 dark:text-teal-300 text-sm">{formatCurrency(payslip.netSalary)}</td>
                      <td className="p-2.5 text-right font-mono text-[11px] text-teal-800 dark:text-teal-300 font-bold">NET</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note matching Wireframe 2B */}
        <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-border">
          Useful note: the Print action generates the employee payslip as PDF; that PDF can be sent from the parent Payrun.
        </p>
      </div>
    </div>,
    document.body
  );
}
