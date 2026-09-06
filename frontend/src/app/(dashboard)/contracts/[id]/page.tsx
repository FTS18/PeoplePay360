"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, FileText, Clock, Info } from "lucide-react";
import { Contract } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";
import { formatCurrency } from "@/utils/format";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contract, setContract] = useState<Contract>({
    id: id || "c1",
    reference: "CON/2026/0042",
    employeeId: "e1",
    employeeName: "Aarav Mehta",
    department: "Finance",
    jobPosition: "Payroll Specialist",
    workingScheduleName: "40 Hours / Week",
    startDate: "2026-01-01",
    endDate: "",
    wage: 85000,
    salaryStructureId: "str-001",
    salaryStructureName: "Employee Salary",
    status: "RUNNING",
  });

  useEffect(() => {
    async function loadContract() {
      try {
        const res = await apiClient.get<Contract>(`/contracts/${id}`);
        if (res) setContract(res);
      } catch {
        // Keeps seeded fallback
      }
    }
    if (id) loadContract();
  }, [id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(ROUTES.CONTRACTS.LIST)}
            className="apple-press flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-2xs"
            aria-label="Back to contracts list"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Contract /</span>
              <h1 className="text-base font-bold text-foreground tracking-tight tabular-nums">
                {contract.reference}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground">Form view of one contract</p>
          </div>
        </div>

        <div>
          <StatusBadge status={contract.status} />
        </div>
      </div>

      {/* Main Form Sheet */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-apple-sm space-y-6">
        {/* Two-Column Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Employee</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                <Link
                  href={ROUTES.EMPLOYEES.DETAIL(contract.employeeId)}
                  className="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  {contract.employeeName || "Aarav Mehta"}
                </Link>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Start Date</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground tabular-nums">
                {contract.startDate || "01-Jan-2026"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">End Date</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground tabular-nums">
                {contract.endDate || "—"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Status</label>
              <div className="p-2 rounded-xl border border-border bg-muted/30 flex items-center">
                <StatusBadge status={contract.status} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Department</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                {contract.department || "Finance"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Job Position</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                {contract.jobPosition || "Payroll Specialist"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Wage / Month</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-bold text-foreground tabular-nums">
                {formatCurrency(contract.wage || 85000)}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Working Schedule</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                {contract.workingScheduleName || "40 Hours / Week"}
              </div>
            </div>
          </div>
        </div>

        {/* Salary Structure / Notes Box */}
        <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-2">
          <div className="text-xs font-bold text-foreground">Salary Structure / Notes</div>
          <div className="text-xs text-muted-foreground">
            <strong className="font-semibold text-foreground">Structure Type:</strong> {contract.salaryStructureName || "Employee Salary"}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This running contract is the source for payroll calculation in the active period.
          </p>
        </div>

        {/* Contract Governance Policy Notice */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-3 border-t border-border/40">
          <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <span>Contract Governance: An employee cannot possess concurrent active running contracts with overlapping date intervals.</span>
        </div>
      </div>
    </div>
  );
}
