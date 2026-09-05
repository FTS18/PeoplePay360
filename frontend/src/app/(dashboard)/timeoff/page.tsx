"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, RefreshCw, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffBalance, TimeOffRequest, TimeOffType } from "@/types";
import { LeaveBalancesRibbon } from "@/components/modules/timeoff/LeaveBalancesRibbon";
import { LeaveRequestsTable } from "@/components/modules/timeoff/LeaveRequestsTable";
import { ApplyLeaveModal } from "@/components/modules/timeoff/ApplyLeaveModal";

export default function TimeOffPage() {
  const { user, role } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [balances, setBalances] = useState<TimeOffBalance[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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
        timeoffService.getRequests(employeeIdParam || undefined),
      ]);
      setTypes(fetchedTypes || []);
      setRequests(fetchedReqs.content || []);

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
  }, [user?.id, employeeIdParam]);

  const handleLeaveCreated = (newReq: TimeOffRequest) => {
    setRequests((prev) => [newReq, ...prev]);
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
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Time-Off & Leave Portal</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage entitlement balances, submit vacation or medical leaves, and review approval queues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Request Leave
          </button>
        </div>
      </div>

      {/* Leave Balances Ribbon */}
      <LeaveBalancesRibbon balances={balances} loading={loading} />

      {/* Requests Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-teal-700" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-stone-800">Leave Applications Queue</h2>
          </div>
          <span className="text-xs text-stone-400">{requests.length} Total Applications</span>
        </div>
        <LeaveRequestsTable
          requests={displayedRequests}
          onStatusChange={handleStatusChange}
        />
      </div>

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
