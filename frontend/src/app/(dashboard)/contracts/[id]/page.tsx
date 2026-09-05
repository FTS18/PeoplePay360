"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, User, Calendar, DollarSign } from "lucide-react";
import { Contract } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contract, setContract] = useState<Contract>({
    id: id || "c1",
    reference: "CNT-2026-001",
    contractReference: "CNT-2026-001",
    employeeId: "e1",
    employeeName: "Michael Scott",
    startDate: "2026-01-01",
    wage: 8500,
    monthlyWage: 8500,
    salaryStructureId: "str-001",
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(ROUTES.CONTRACTS.LIST)}
          className="rounded-lg border border-(--border) p-2 hover:bg-(--accent)"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-(--foreground)">
              {contract.contractReference}
            </h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="text-xs text-(--muted-foreground)">Employment Agreement Terms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-(--border) pb-2">
            <User className="h-4 w-4 text-(--muted-foreground)" strokeWidth={1.5} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-(--foreground)">
              Contracted Employee
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-(--muted-foreground)">Assigned Employee</span>
              <p className="font-semibold text-(--foreground) mt-0.5">
                <Link
                  href={ROUTES.EMPLOYEES.DETAIL(contract.employeeId)}
                  className="text-(--primary) hover:underline"
                >
                  {contract.employeeName || contract.employeeId}
                </Link>
              </p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Salary Structure</span>
              <p className="font-semibold text-(--foreground) mt-0.5">Standard Corporate Structure</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-(--border) pb-2">
            <DollarSign className="h-4 w-4 text-(--muted-foreground)" strokeWidth={1.5} />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-(--foreground)">
              Financial Compensation
            </h2>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-(--muted-foreground)">Monthly Base Wage</span>
              <p className="text-xl font-bold text-(--foreground) mt-0.5 tabular-nums" suppressHydrationWarning>
                ${Number(contract.monthlyWage).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-(--muted-foreground)">Effective Start</span>
                <p className="font-medium text-(--foreground) mt-0.5">{contract.startDate}</p>
              </div>
              <div>
                <span className="text-(--muted-foreground)">Effective End</span>
                <p className="font-medium text-(--foreground) mt-0.5">{contract.endDate || "Indefinite"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
