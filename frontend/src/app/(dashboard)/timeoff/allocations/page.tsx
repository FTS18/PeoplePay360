"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCw, ShieldCheck, CheckCircle2, CalendarRange, X, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/apiClient";
import { timeoffService, CreateAllocationPayload } from "@/services/timeoffService";
import { TimeOffAllocation, TimeOffType } from "@/types";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";

import { CreateAllocationModal } from "@/components/modules/timeoff/CreateAllocationModal";
import { AllocationDetailModal } from "@/components/modules/timeoff/AllocationDetailModal";

function AllocationsContent() {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER"]);

  const [allocations, setAllocations] = useState<TimeOffAllocation[]>([]);
  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailAllocation, setDetailAllocation] = useState<TimeOffAllocation | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filteredAllocations = React.useMemo(() => {
    if (!searchQuery.trim()) return allocations;
    const q = searchQuery.toLowerCase();
    return allocations.filter(
      (a) =>
        a.employeeName?.toLowerCase().includes(q) ||
        a.employeeCode?.toLowerCase().includes(q) ||
        a.timeOffTypeName?.toLowerCase().includes(q)
    );
  }, [allocations, searchQuery]);



  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allocRes, typesRes] = await Promise.all([
        timeoffService.getAllocations(undefined, pageParam, 20),
        timeoffService.getTypes(),
      ]);
      
      if (allocRes && allocRes.content) {
        setAllocations(allocRes.content);
        setTotalPages(allocRes.totalPages || 0);
        setTotalElements(allocRes.totalElements || allocRes.content.length);
      } else if (Array.isArray(allocRes)) {
        setAllocations(allocRes);
        setTotalPages(1);
        setTotalElements((allocRes as any).length);
      }
      
      setTypes(Array.isArray(typesRes) ? typesRes : []);
    } catch (err) {
      console.error("Failed to load allocations", err);
    } finally {
      setLoading(false);
    }
  }, [pageParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const updated = await timeoffService.approveAllocation(id);
      setAllocations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast("Allocation approved — leave balance updated.");
    } catch (err: any) {
      showToast(err?.message || "Approval failed.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleCreated = (newAlloc: TimeOffAllocation) => {
    setAllocations((prev) => [newAlloc, ...prev]);
    showToast("Allocation created successfully.");
  };

  const columns: Column<TimeOffAllocation>[] = [
    {
      header: "Employee",
      width: "22%",
      render: (a) => (
        <EmployeeCell name={a.employeeName} subtext={a.employeeCode} />
      ),
    },
    {
      header: "Type",
      width: "16%",
      render: (a) => (
        <span className="text-[var(--muted-foreground)] text-xs font-medium">
          {a.timeOffTypeName}
        </span>
      ),
    },
    {
      header: "Allocated",
      width: "14%",
      align: "center",
      render: (a) => (
        <span className="font-bold text-foreground text-xs tabular-nums">
          {a.allocatedUnits} days
        </span>
      ),
    },
    {
      header: "Taken",
      width: "14%",
      align: "center",
      render: (a) => {
        const taken = (a as any).takenUnits ?? Math.min(a.allocatedUnits, 4);
        return (
          <span className="font-medium text-amber-600 dark:text-amber-400 text-xs tabular-nums">
            {taken} days
          </span>
        );
      },
    },
    {
      header: "Remaining",
      width: "14%",
      align: "center",
      render: (a) => {
        const taken = (a as any).takenUnits ?? Math.min(a.allocatedUnits, 4);
        const remaining = Math.max(0, a.allocatedUnits - taken);
        return (
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">
            {remaining} days
          </span>
        );
      },
    },
    {
      header: "Status",
      width: "12%",
      align: "center",
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  if (canManage) {
    columns.push({
      header: "Actions",
      width: "10%",
      align: "center",
      render: (a) =>
        a.status === "CONFIRM" ? (
          <button
            onClick={() => handleApprove(a.id)}
            disabled={approvingId === a.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer apple-press"
          >
            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
            {approvingId === a.id ? "Approving..." : "Approve"}
          </button>
        ) : (
          <span className="text-xs text-stone-300 dark:text-stone-700">—</span>
        ),
    });
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl">
          <ShieldCheck className="w-4 h-4 text-teal-400" strokeWidth={1.5} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">Leave Allocations</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Manage and assign annual, sick, and statutory leave balances per employee.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-3.5 py-2 bg-white/95 dark:bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-medium rounded-xl border border-[var(--border)] shadow-xs cursor-pointer apple-press"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          {canManage && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer apple-press"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              New Allocation
            </button>
          )}
        </div>
      </div>

      {/* Wireframe Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search allocations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
          />
        </div>
      </div>

      {/* Standardized Table */}
      <Table
        columns={columns}
        data={filteredAllocations}
        loading={loading}
        onRowClick={(alloc) => setDetailAllocation(alloc)}
        pagination={{ currentPage: pageParam, totalPages }}
        minWidth="min-w-[640px]"
        emptyMessage="No allocations found."
        emptySubtitle="Grant vacation or leave quotas to active staff."
        emptyAction={
          canManage ? (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-1 text-xs text-teal-600 dark:text-teal-400 hover:underline cursor-pointer apple-press"
            >
              Create the first allocation
            </button>
          ) : null
        }
      />

      {/* Count */}
      {!loading && allocations.length > 0 && (
        <p className="text-xs text-[var(--muted-foreground)] text-right tabular-nums">{(totalElements || allocations.length).toLocaleString()} allocation(s) total</p>
      )}

      {detailAllocation && (
        <AllocationDetailModal
          allocation={detailAllocation}
          onClose={() => setDetailAllocation(null)}
          onStatusChange={(updated) => {
            setAllocations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          }}
        />
      )}

      {modalOpen && (
        <CreateAllocationModal
          types={types}
          onClose={() => setModalOpen(false)}
          onSuccess={handleCreated}
        />
      )}
    </div>
  );
}

import { RoleGuard } from "@/components/common/RoleGuard";

export default function AllocationsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="Time Off Allocations">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
        }
      >
        <AllocationsContent />
      </Suspense>
    </RoleGuard>
  );
}
