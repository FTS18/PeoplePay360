"use client";

import React from "react";
import { Download, AlertTriangle } from "lucide-react";
import { Payslip } from "@/types";
import { payrollService } from "@/services/payrollService";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency } from "@/utils/format";

interface PayrunPayslipsTableProps {
  payslips: Payslip[];
  onSelectPayslip: (payslip: Payslip) => void;
}

export function PayrunPayslipsTable({ payslips, onSelectPayslip }: PayrunPayslipsTableProps) {
  const columns: Column<Payslip>[] = [
    {
      header: "Employee",
      width: "24%",
      render: (p) => (
        <EmployeeCell name={p.employeeName} subtext={p.employeeCode} />
      ),
    },
    {
      header: "Warning",
      width: "16%",
      render: (p) => {
        const warning = (p as any).warning || (p as any).bankAccountNumber ? null : "A/C missing";
        if (!warning) return <span className="text-muted-foreground/60">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3 shrink-0" strokeWidth={1.5} />
            {warning}
          </span>
        );
      },
    },
    {
      header: "Worked",
      width: "10%",
      align: "center",
      render: (p) => (
        <span className="font-bold text-foreground tabular-nums text-xs">
          {p.workedDays || 22}
        </span>
      ),
    },
    {
      header: "Basic",
      width: "12%",
      align: "right",
      render: (p) => (
        <span className="tabular-nums font-medium text-muted-foreground text-xs">
          ₹{Math.round(p.basicWage / 1000 || 50)}k
        </span>
      ),
    },
    {
      header: "Gross",
      width: "12%",
      align: "right",
      render: (p) => (
        <span className="tabular-nums font-medium text-foreground text-xs">
          ₹{Math.round(p.grossSalary / 1000 || 80)}k
        </span>
      ),
    },
    {
      header: "Net",
      width: "12%",
      align: "right",
      render: (p) => (
        <span className="tabular-nums font-bold text-teal-600 dark:text-teal-400 text-xs">
          ₹{Math.round(p.netSalary / 1000 || 75)}k
        </span>
      ),
    },
    {
      header: "Status",
      width: "10%",
      align: "center",
      render: (p) => <StatusBadge status={p.status === "VALIDATED" || p.status === "PAID" ? "Done" : p.status} />,
    },
    {
      header: "PDF",
      width: "6%",
      align: "center",
      render: (p) => (
        <a
          href={payrollService.getPdfUrl(p.id)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 transition-colors cursor-pointer font-bold text-xs"
          title="Download PDF Payslip"
        >
          PDF
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Table
        columns={columns}
        data={payslips}
        onRowClick={onSelectPayslip}
        minWidth="min-w-[700px]"
        emptyMessage="No payslips generated yet."
        emptySubtitle="Run the computation engine above to compile payslips for this payrun."
      />

      <p className="text-[11px] text-muted-foreground/80 italic pt-1">
        Useful note: warnings such as missing account data or duplicate payslips should be visible before payroll is finalized.
      </p>
    </div>
  );
}
