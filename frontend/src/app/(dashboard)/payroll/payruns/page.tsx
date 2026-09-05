"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCw, ChevronRight, Search, Calendar, AlertTriangle } from "lucide-react";
import { payrollService } from "@/services/payrollService";
import { Payrun, SalaryStructure } from "@/types";
import { CreatePayrunModal } from "@/components/modules/payroll/CreatePayrunModal";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatReferenceTitle } from "@/utils/format";

function PayrunsContent() {
  const [payruns, setPayruns] = useState<Payrun[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("2026");

  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [runsRes, structsRes] = await Promise.all([
        payrollService.getPayruns(pageParam, 15),
        payrollService.getStructures(),
      ]);
      
      if (runsRes && runsRes.content) {
        setPayruns(runsRes.content);
        setTotalPages(runsRes.totalPages || 0);
      } else if (Array.isArray(runsRes)) {
        setPayruns(runsRes as any);
        setTotalPages(1);
      }
      
      setStructures(structsRes || []);
    } catch (err) {
      console.error("Failed to load payruns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pageParam]);

  const filtered = payruns.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.status?.toLowerCase().includes(q)) return false;
    }
    if (yearFilter !== "ALL" && p.periodStart && !p.periodStart.includes(yearFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PayrollSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Payroll /</span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Payruns</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Payrun view for payroll periods
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="apple-press inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>NEW</span>
          </button>
        </div>
      </div>

      {/* Top Search & Filter Bar matching Wireframe 1A */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payruns..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer font-semibold"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="ALL">All Years</option>
          </select>
        </div>
      </div>

      {/* Wireframe Card Items List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading payruns...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-2xl p-6 bg-card">
            No payruns found matching query. Click NEW to initialize a payrun.
          </div>
        ) : (
          filtered.map((p) => {
            const warningCount = p.status === "DRAFT" ? 0 : p.status === "VALIDATED" ? 2 : 1;
            return (
              <Link
                key={p.id}
                href={`/payroll/payruns/${p.id}`}
                className="apple-press block p-4 rounded-2xl border border-border bg-card hover:border-teal-500/40 transition-all shadow-2xs group cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {formatReferenceTitle(p.name)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {p.periodStart} — {p.periodEnd}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-10">
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      {p.payslipsCount || 42} employees
                    </span>

                    <div className="text-right">
                      <div className="mb-0.5">
                        <StatusBadge status={p.status} />
                      </div>
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                        {warningCount > 0 && <AlertTriangle className="w-3 h-3 shrink-0" strokeWidth={1.5} />}
                        {warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? "s" : ""}` : "No warnings"}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-600 shrink-0" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Wireframe Footer Note */}
      <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-border">
        Useful note: each Payrun represents one payroll period and groups the payslips generated for that period.
      </p>

      <CreatePayrunModal
        isOpen={modalOpen}
        structures={structures}
        onClose={() => setModalOpen(false)}
        onSuccess={(created) => setPayruns([created, ...payruns])}
      />
    </div>
  );
}

import { RoleGuard } from "@/components/common/RoleGuard";

export default function PayrunsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"]} pageName="Payroll Batch Executions">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
        }
      >
        <PayrunsContent />
      </Suspense>
    </RoleGuard>
  );
}
