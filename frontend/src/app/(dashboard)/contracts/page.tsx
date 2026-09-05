"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, ShieldCheck, Search, ChevronRight, FileText } from "lucide-react";
import { Contract, Employee } from "@/types";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ContractModal } from "@/components/contracts/ContractModal";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/utils/format";

function ContractsContent() {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const canManage = role === "HR_MANAGER" || role === "ADMIN" || role === "HR_PAYROLL_MANAGER";

  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pageParam.toString(),
          size: "20",
        });
        if (employeeIdParam) queryParams.append("employeeId", employeeIdParam);
        
        const url = `/contracts?${queryParams.toString()}`;
        
        const [cRes, eRes] = await Promise.all([
          apiClient.get<any>(url),
          apiClient.get<any>("/employees?size=100"),
        ]);
        
        if (cRes && cRes.content) {
          setContracts(cRes.content);
          setTotalPages(cRes.totalPages || 0);
        } else if (Array.isArray(cRes)) {
          setContracts(cRes);
          setTotalPages(1);
        }
        
        const employeesList = Array.isArray(eRes) ? eRes : (eRes?.content || []);
        if (employeesList) setEmployees(employeesList);
      } catch {
        // Retain existing state if any
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeIdParam, pageParam]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contracts.filter(
      (c) =>
        !q ||
        (c.reference || "").toLowerCase().includes(q) ||
        (c.employeeName || "").toLowerCase().includes(q) ||
        c.employeeId.toLowerCase().includes(q)
    );
  }, [contracts, search]);

  const columns: Column<Contract>[] = [
    {
      header: "Reference",
      accessor: "reference",
      width: "18%",
      className: "text-xs font-semibold tabular-nums",
      render: (cnt) => (
        <Link 
          href={ROUTES.CONTRACTS.DETAIL(cnt.id)} 
          className="text-teal-700 dark:text-teal-400 tabular-nums font-semibold hover:underline"
        >
          {cnt.reference}
        </Link>
      ),
    },
    {
      header: "Employee",
      accessor: "employeeId",
      width: "28%",
      render: (cnt) => {
        const emp = employees.find((e) => e.id === cnt.employeeId);
        return (
          <EmployeeCell
            name={cnt.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : "Employee")}
            subtext={emp?.employeeCode || cnt.jobPosition || "Contract"}
          />
        );
      },
    },
    {
      header: "Start",
      accessor: "startDate",
      width: "12%",
      render: (cnt) => <span className="text-xs tabular-nums text-muted-foreground">{cnt.startDate || "-"}</span>,
    },
    {
      header: "End",
      accessor: "endDate",
      width: "12%",
      render: (cnt) => <span className="text-xs tabular-nums text-muted-foreground">{cnt.endDate || "-"}</span>,
    },
    {
      header: "Wage / Month",
      accessor: "wage",
      width: "14%",
      align: "right",
      render: (cnt) => (
        <span className="tabular-nums text-xs font-bold text-foreground" suppressHydrationWarning>
          {formatCurrency(cnt.wage)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      width: "12%",
      align: "center",
      render: (cnt) => <StatusBadge status={cnt.status} />,
    },
    {
      header: "Actions",
      accessor: "id",
      width: "8%",
      align: "right",
      render: (cnt) => (
        <Link
          href={ROUTES.CONTRACTS.DETAIL(cnt.id)}
          className="apple-press inline-flex items-center text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
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
          <h1 className="text-xl font-bold tracking-tight text-foreground">Contracts</h1>
          <p className="text-xs text-muted-foreground">
            {employeeIdParam
              ? `Displaying contract records filtered by Employee ID (${employeeIdParam.substring(0, 8)}...)`
              : "Manage employment agreements, salary terms, and wage structures"}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="apple-press inline-flex items-center justify-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 py-2 px-4 text-xs font-semibold text-white shadow-apple-sm transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>New Contract</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-3.5 text-xs text-teal-800 dark:text-teal-300 shadow-2xs">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <span className="leading-relaxed">
          PostgreSQL GiST zero-overlap exclusion guard active: concurrent running contract dates are strictly rejected at the database level.
        </span>
      </div>

      {/* Apple Spotlight Search Field */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Filter contracts by reference or employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card py-2 pl-9.5 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 transition-all"
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-card/60 p-6 space-y-4 animate-pulse shadow-apple-sm">
          <div className="h-4 w-48 rounded-full bg-stone-200 dark:bg-stone-800" />
          <div className="space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-10 w-full rounded-xl bg-stone-200/60 dark:bg-stone-800/60" />
            ))}
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          pagination={{ currentPage: pageParam, totalPages }}
          emptyMessage={employeeIdParam ? "No contracts found for this employee." : "No active contracts found."}
          emptySubtitle="Contracts track wage details and valid periods."
          emptyAction={
            canManage && !employeeIdParam ? (
              <button
                onClick={() => setModalOpen(true)}
                className="apple-press inline-flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-apple-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Draft Contract
              </button>
            ) : undefined
          }
        />
      )}

      <ContractModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employees={employees}
        onSaved={(newContract) => setContracts((prev) => [newContract, ...prev])}
      />
    </div>
  );
}

import { RoleGuard } from "@/components/common/RoleGuard";

export default function ContractsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="Employment Contracts">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
        }
      >
        <ContractsContent />
      </Suspense>
    </RoleGuard>
  );
}

