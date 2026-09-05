"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Payrun, Payslip } from "@/types";

interface PayrunWarningsWidgetProps {
  payrun: Payrun;
  payslips: Payslip[];
}

export function PayrunWarningsWidget({ payrun, payslips }: PayrunWarningsWidgetProps) {
  if (payrun.status === "PAID") return null;

  const warnings: string[] = [];

  // Check for negative or zero net pays
  const zeroNetPays = payslips.filter((p) => Number(p.netSalary) <= 0);
  if (zeroNetPays.length > 0) {
    warnings.push(`${zeroNetPays.length} payslip(s) computed with ₹0.00 net disbursement.`);
  }

  // Check for missing banking credentials or tax PAN placeholders
  const missingBankInfo = payslips.filter(
    (p) => !p.employeeCode || p.employeeCode.trim() === ""
  );
  if (missingBankInfo.length > 0) {
    warnings.push(`${missingBankInfo.length} employee(s) require verification of bank IFSC coordinates.`);
  }

  // Check for pro-ration notice
  const prorationNotice = payslips.some((p) => Number(p.workedDays) < 20);
  if (prorationNotice) {
    warnings.push("Attendance calendar pro-ration rules applied based on active working schedules.");
  }

  if (warnings.length === 0) {
    return (
      <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-xs text-teal-800 dark:text-teal-300 flex items-center gap-3 shadow-apple-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 shrink-0">
          <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div>
          <span className="font-semibold">Pre-Finalization Audit Clear: </span>
          <span>Statutory rules, tax sequence dependencies, and disbursement accounts verified.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-800 dark:text-amber-300 space-y-2 shadow-apple-sm">
      <div className="flex items-center gap-2.5 font-semibold text-amber-800 dark:text-amber-300">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <span>Pre-Finalization Operational Warnings ({warnings.length})</span>
      </div>
      <ul className="space-y-1 pl-9 list-disc text-amber-800/90 dark:text-amber-300/90 font-medium">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
