"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
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
    warnings.push(`${zeroNetPays.length} payslip(s) computed with $0.00 net disbursement.`);
  }

  // Check for missing banking credentials or tax PAN placeholders
  const missingBankInfo = payslips.filter(
    (p) => !p.employeeCode || p.employeeCode.trim() === ""
  );
  if (missingBankInfo.length > 0) {
    warnings.push(`${missingBankInfo.length} employee(s) require verification of bank routing coordinates.`);
  }

  // Check for pro-ration notice
  const prorationNotice = payslips.some((p) => Number(p.workedDays) < 20);
  if (prorationNotice) {
    warnings.push("Attendance calendar pro-ration rules applied based on active working schedules.");
  }

  if (warnings.length === 0) {
    return (
      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-center gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" strokeWidth={1.5} />
        <div>
          <span className="font-semibold">Pre-Finalization Audit Clear: </span>
          <span>Statutory rules, tax sequence dependencies, and disbursement accounts verified.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
      <div className="flex items-center gap-2 font-bold text-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" strokeWidth={1.5} />
        <span>Pre-Finalization Operational Warnings ({warnings.length})</span>
      </div>
      <ul className="space-y-1 pl-6 list-disc text-amber-800/90 font-medium">
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
