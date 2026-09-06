"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCw, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffBalance, TimeOffRequest, TimeOffType } from "@/types";
import { LeaveBalancesRibbon } from "@/components/modules/timeoff/LeaveBalancesRibbon";
import { LeaveRequestsTable } from "@/components/modules/timeoff/LeaveRequestsTable";
import { ApplyLeaveModal } from "@/components/modules/timeoff/ApplyLeaveModal";
import { TimeOffDetailModal } from "@/components/modules/timeoff/TimeOffDetailModal";

function TimeOffContent() {
  const { user, role } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [balances, setBalances] = useState<TimeOffBalance[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [detailRequest, setDetailRequest] = useState<TimeOffRequest | null>(null);

  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const displayedRequests = React.useMemo(() => {
    if (role === "EMPLOYEE" && user) {
      const fullName = `${user.firstName} ${user.lastName}`.trim().toLowerCase();
      return requests.filter(
        (r) =>
          r.employeeId === user.id ||
          (r.employeeName && r.employeeName.toLowerCase().includes(fullName)) ||
          (r.employeeName && r.employeeName.toLowerCase().includes(user.firstName.toLowerCase()))
      );
    }
    return requests;
  }, [requests, role, user]);

  const loadData = async () => {
    if (requests.length === 0 && types.length === 0) {
      setLoading(true);
    }
    try {
      const [fetchedTypes, fetchedReqs] = await Promise.all([
        timeoffService.getTypes(),
        timeoffService.getRequests(employeeIdParam || undefined, pageParam, 15),
      ]);
      setTypes(fetchedTypes || []);
      
      if (fetchedReqs && fetchedReqs.content) {
        setRequests(fetchedReqs.content);
        setTotalPages(fetchedReqs.totalPages || 0);
        setTotalElements(fetchedReqs.totalElements || fetchedReqs.content.length);
      } else if (Array.isArray(fetchedReqs)) {
        setRequests(fetchedReqs as any);
        setTotalPages(1);
        setTotalElements((fetchedReqs as any).length);
      }

      const targetEmpId = employeeIdParam || user?.id;
      if (targetEmpId) {
        const fetchedBals = await timeoffService.getBalances(targetEmpId);
        setBalances(fetchedBals || []);
      }
    } catch (err) {
      console.error("Failed to load time-off portal data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, employeeIdParam, pageParam]);

  const handleLeaveCreated = (newReq: TimeOffRequest) => {
    setRequests((prev) => [newReq, ...prev]);
    setTotalElements((prev) => prev + 1);
    if (user?.id) {
      timeoffService.getBalances(user.id).then(setBalances).catch(console.error);
    }
  };

  const handleStatusChange = (updated: TimeOffRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (user?.id) {
      timeoffService.getBalances(user.id).then(setBalances).catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">Time-Off &amp; Leave Portal</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Manage entitlement balances, submit vacation or medical leaves, and review approval queues.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-full shadow-md shadow-teal-900/20 transition-all cursor-pointer apple-press self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Request Leave
        </button>
      </div>

      {/* Leave Balances Ribbon */}
      <LeaveBalancesRibbon balances={balances} loading={loading} />

      {/* Requests Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-teal-700 dark:text-teal-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-foreground">Leave Applications Queue</h2>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums font-medium">{(totalElements || requests.length).toLocaleString()} Total Applications</span>
        </div>
        <LeaveRequestsTable
          requests={displayedRequests}
          onStatusChange={handleStatusChange}
          onRowClick={(req) => setDetailRequest(req)}
          pagination={{ currentPage: pageParam, totalPages }}
        />
      </div>

      {/* Time Off Request Form View Modal */}
      {detailRequest && (
        <TimeOffDetailModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={modalOpen}
        types={types}
        onClose={() => setModalOpen(false)}
        onSuccess={handleLeaveCreated}
      />
    </div>
  );
}

export default function TimeOffPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            <div className="h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
            <div className="h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
        </div>
      }
    >
      <TimeOffContent />
    </Suspense>
  );
}

