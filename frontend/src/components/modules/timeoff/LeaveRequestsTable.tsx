"use client";

import React, { useState } from "react";
import { Check, X, ShieldAlert } from "lucide-react";
import { TimeOffRequest, TimeOffStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { timeoffService } from "@/services/timeoffService";

interface LeaveRequestsTableProps {
  requests: TimeOffRequest[];
  onStatusChange: (updated: TimeOffRequest) => void;
}

export function LeaveRequestsTable({ requests, onStatusChange }: LeaveRequestsTableProps) {
  const { hasRole } = useAuth();
  const canApprove = hasRole(["ADMIN", "HR_MANAGER"]);
  const [filter, setFilter] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const updated = await timeoffService.approveRequest(id);
      onStatusChange(updated);
    } catch (err) {
      console.error("Failed to approve leave", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefuse = async (id: string) => {
    setProcessingId(id);
    try {
      const updated = await timeoffService.refuseRequest(id, "Refused by HR Manager");
      onStatusChange(updated);
    } catch (err) {
      console.error("Failed to refuse leave", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return r.status === "CONFIRM" || r.status === "DRAFT";
    return r.status === filter;
  });

  const getStatusPill = (status: TimeOffStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REFUSED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
      {/* Tabs */}
      <div className="px-6 py-3 border-b border-stone-100 flex items-center gap-2 text-xs">
        {["ALL", "PENDING", "APPROVED", "REFUSED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === tab
                ? "bg-teal-700 text-white shadow-xs"
                : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            }`}
          >
            {tab === "ALL" ? "All Requests" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50/75 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Dates</th>
              <th className="py-3.5 px-4 text-center">Duration</th>
              <th className="py-3.5 px-4">Status</th>
              {canApprove && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canApprove ? 6 : 5} className="py-8 text-center text-stone-400">
                  No leave requests found in this category.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-800">{r.employeeName || "Employee"}</div>
                    <div className="text-xs text-stone-400">{r.employeeCode || "EMP"}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">{r.timeOffTypeName}</td>
                  <td className="py-3.5 px-4 text-stone-600 text-xs">
                    {r.startDate} to {r.endDate}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-stone-800">
                    {r.requestedUnits}d
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusPill(
                        r.status
                      )}`}
                    >
                      {r.status === "CONFIRM" ? "PENDING" : r.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td className="py-3.5 px-4 text-right">
                      {r.status === "CONFIRM" && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={processingId === r.id}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            title="Approve Request"
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => handleRefuse(r.id)}
                            disabled={processingId === r.id}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="Refuse Request"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
