"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, ShieldCheck, Search, ChevronRight, FileText } from "lucide-react";
import { Contract, Employee } from "@/types";
import { Table, Column } from "@/components/common/Table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ContractModal } from "@/components/contracts/ContractModal";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function ContractsPage() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const canManage = role === "HR_MANAGER" || role === "ADMIN" || role === "HR_PAYROLL_MANAGER";

  useEffect(() => {
    const url = employeeIdParam ? `/contracts?employeeId=${employeeIdParam}` : "/contracts";
    const cachedContracts = apiClient.getFromCache<any>(url);
    const cachedEmployees = apiClient.getFromCache<any>("/employees?size=100");
    const cList = Array.isArray(cachedContracts) ? cachedContracts : cachedContracts?.content;
    const eList = Array.isArray(cachedEmployees) ? cachedEmployees : cachedEmployees?.content;
    if (cList && cList.length > 0) {
      setContracts(cList);
      setLoading(false);
    }
    if (eList && eList.length > 0) {
      setEmployees(eList);
    }

    async function loadData() {
      try {
        const [cRes, eRes] = await Promise.all([
          apiClient.get<any>(url),
          apiClient.get<any>("/employees?size=100"),
        ]);
        const contractsList = Array.isArray(cRes) ? cRes : (cRes?.content || []);
        const employeesList = Array.isArray(eRes) ? eRes : (eRes?.content || []);
        if (contractsList) setContracts(contractsList);
        if (employeesList) setEmployees(employeesList);
      } catch {
        // Retain existing state if any
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeIdParam]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contracts.filter(
      (c) =>
        !q ||
        (c.contractReference || c.reference || "").toLowerCase().includes(q) ||
        (c.employeeName || "").toLowerCase().includes(q) ||
        c.employeeId.toLowerCase().includes(q)
    );
  }, [contracts, search]);

  const columns: Column<Contract>[] = [
    {
      header: "Reference",
      accessor: "reference",
      className: "text-xs font-semibold w-36",
      render: (cnt) => (
        <Link href={ROUTES.CONTRACTS.DETAIL(cnt.id)} className="text-(--primary) hover:underline">
          {cnt.contractReference || cnt.reference}
        </Link>
      ),
    },
    {
      header: "Employee",
      accessor: "employeeId",
      render: (cnt) => (
        <div>
          <div className="font-semibold text-(--foreground)">{cnt.employeeName || cnt.employeeId}</div>
          <div className="text-[11px] text-(--muted-foreground)">ID: {cnt.employeeId.substring(0, 8)}...</div>
        </div>
      ),
    },
    {
      header: "Start Date",
      accessor: "startDate",
      render: (cnt) => <span className="text-xs">{cnt.startDate}</span>,
    },
    {
      header: "Monthly Wage",
      accessor: "wage",
      align: "right",
      render: (cnt) => (
        <span className="font-mono text-xs font-semibold text-(--foreground)" suppressHydrationWarning>
          ${Number(cnt.wage || cnt.monthlyWage || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      align: "center",
      render: (cnt) => <StatusBadge status={cnt.status} />,
    },
    {
      header: "Actions",
      accessor: "id",
      align: "right",
      render: (cnt) => (
        <Link
          href={ROUTES.CONTRACTS.DETAIL(cnt.id)}
          className="inline-flex items-center text-xs text-(--primary) hover:underline"
        >
          View <ChevronRight className="h-3 w-3 ml-0.5" strokeWidth={1.5} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-(--foreground)">Contracts</h1>
          <p className="text-xs text-(--muted-foreground)">
            {employeeIdParam
              ? `Displaying contract records filtered by Employee ID (${employeeIdParam.substring(0, 8)}...)`
              : "Manage employment agreements, salary terms, and wage structures"}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-(--primary) py-2 px-3 text-xs font-medium text-(--primary-foreground) hover:bg-(--primary)/90 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>New Contract</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800">
        <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>
          PostgreSQL GiST zero-overlap exclusion guard active: concurrent running contract dates are strictly rejected at the database level.
        </span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-(--muted-foreground)" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Filter contracts by reference or employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--card) py-2 pl-9 pr-3 text-xs text-(--foreground) focus:border-(--primary) focus:outline-hidden"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-(--border) bg-(--card) p-6 space-y-4 animate-pulse">
          <div className="h-4 w-48 rounded bg-(--muted)" />
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-10 w-full rounded bg-(--muted)/60" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--border) p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--muted) text-(--muted-foreground) mb-3">
            <FileText className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-(--foreground)">No contracts found</h3>
          <p className="text-xs text-(--muted-foreground) mt-1 max-w-sm">
            {search
              ? "No contracts match your search reference."
              : "No employment contracts have been registered for this filter yet."}
          </p>
        </div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      <ContractModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employees={employees}
        onSaved={(newCnt) => setContracts((prev) => [newCnt, ...prev])}
      />
    </div>
  );
}
