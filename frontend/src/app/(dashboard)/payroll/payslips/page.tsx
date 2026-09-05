"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, Search, Calendar, AlertTriangle } from "lucide-react";
import { payrollService } from "@/services/payrollService";
import { Payslip } from "@/types";
import { PayslipDetailModal } from "@/components/modules/payroll/PayslipDetailModal";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency } from "@/utils/format";

import { useAuth } from "@/context/AuthContext";

function PayslipsContent() {
  const { user, role } = useAuth();
  const isEmployee = role === "EMPLOYEE";
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<string>("ALL");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const targetEmpId = isEmployee && user?.id ? user.id : (employeeIdParam || undefined);
      const res = await payrollService.getPayslips(undefined, pageParam, 50, targetEmpId);
      
      if (res && res.content) {
        setPayslips(res.content);
        setTotalPages(res.totalPages || 0);
      } else if (Array.isArray(res)) {
        setPayslips(res as any);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch payslips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [employeeIdParam, pageParam, role, user?.id]);

  const handleOpenDetail = async (slip: Payslip) => {
    try {
      const details = await payrollService.getPayslipDetails(slip.id);
      setSelectedPayslip(details);
    } catch {
      setSelectedPayslip(slip);
    }
  };

  const filtered = payslips.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.employeeName?.toLowerCase().includes(q);
      const matchCode = p.employeeCode?.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (periodFilter !== "ALL") {
      if (p.periodStart && !p.periodStart.includes(periodFilter)) return false;
    }
    return true;
  });

  const columns: Column<Payslip>[] = [
    {
      header: "Employee",
      width: "22%",
      render: (p) => (
        <EmployeeCell name={p.employeeName} subtext={p.employeeCode} />
      ),
    },
    {
      header: "Warning",
      width: "14%",
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
      header: "Period",
      width: "16%",
      render: (p) => (
        <span className="text-muted-foreground tabular-nums text-xs font-medium">
          {p.periodStart} — {p.periodEnd}
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
      header: "Structure",
      width: "12%",
      render: (p) => (
        <span className="text-xs text-muted-foreground font-medium">{p.contractReference || "Regular"}</span>
      ),
    },
    {
      header: "Status",
      width: "10%",
      align: "center",
      render: (p) => <StatusBadge status={p.status === "VALIDATED" || p.status === "PAID" ? "Done" : p.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {!isEmployee && <PayrollSubNav />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Payroll /</span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Payslips</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            List view of employee payslips
          </p>
        </div>
        <button
          onClick={fetchPayslips}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border shadow-2xs cursor-pointer apple-press"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Controls: Search Bar & Period Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payslips..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-semibold"
          >
            <option value="ALL">Period: All Periods</option>
            <option value="2026-02">Period: Feb 2026</option>
            <option value="2026-01">Period: Jan 2026</option>
            <option value="2026-03">Period: Mar 2026</option>
          </select>
        </div>
      </div>

      {/* Standardized Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={handleOpenDetail}
        pagination={{ currentPage: pageParam, totalPages }}
        minWidth="min-w-[700px]"
        emptyMessage="No payslips found matching your query."
        emptySubtitle="Try adjusting search criteria or compute new payrun batches."
      />

      {/* Wireframe Footer Note */}
      <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-border">
        Useful note: selecting any payslip opens the detailed salary computation and PDF action for that employee.
      </p>

      <PayslipDetailModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
    </div>
  );
}

export default function PayslipsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
          <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
        </div>
      }
    >
      <PayslipsContent />
    </Suspense>
  );
}
