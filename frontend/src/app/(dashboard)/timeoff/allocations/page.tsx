"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, ShieldCheck, CheckCircle2, CalendarRange, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { timeoffService, CreateAllocationPayload } from "@/services/timeoffService";
import { TimeOffAllocation, TimeOffType } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-stone-100 text-stone-600 border-stone-200",
  CONFIRM: "bg-sky-50 text-sky-700 border-sky-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REFUSED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-stone-100 text-stone-400 border-stone-200",
};

interface CreateAllocationModalProps {
  types: TimeOffType[];
  onClose: () => void;
  onSuccess: (allocation: TimeOffAllocation) => void;
}

function CreateAllocationModal({ types, onClose, onSuccess }: CreateAllocationModalProps) {
  const [form, setForm] = useState<CreateAllocationPayload>({
    employeeId: "",
    timeOffTypeId: "",
    allocatedUnits: 1,
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
  });
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/employees?page=0&size=100", {
      headers: { Authorization: `Bearer ${localStorage.getItem("pp360_token")}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const content = res?.data?.content ?? [];
        setEmployees(
          content.map((e: any) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName} (${e.employeeCode})`,
          }))
        );
      })
      .catch(() => setEmployees([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId || !form.timeOffTypeId) {
      setError("Employee and leave type are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await timeoffService.createAllocation(form);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create allocation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200/80">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <CalendarRange className="w-5 h-5 text-teal-700" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-stone-900">New Leave Allocation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">Employee</label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">Leave Type</label>
            <select
              value={form.timeOffTypeId}
              onChange={(e) => setForm((p) => ({ ...p, timeOffTypeId: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            >
              <option value="">Select leave type...</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600">Allocated Units (days/hours)</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={form.allocatedUnits}
              onChange={(e) => setForm((p) => ({ ...p, allocatedUnits: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm((p) => ({ ...p, validFrom: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600">Valid To</label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm((p) => ({ ...p, validTo: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Creating..." : "Create Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AllocationsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER"]);

  const [allocations, setAllocations] = useState<TimeOffAllocation[]>([]);
  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allocRes, typesRes] = await Promise.all([
        timeoffService.getAllocations(),
        timeoffService.getTypes(),
      ]);
      setAllocations(Array.isArray(allocRes.content) ? allocRes.content : []);
      setTypes(Array.isArray(typesRes) ? typesRes : []);
    } catch (err) {
      console.error("Failed to load allocations", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Leave Allocations</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage annual entitlement grants per employee and leave type. Approve to activate leave balance.
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
          {canManage && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              New Allocation
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/75 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4 text-right">Allocated Units</th>
                <th className="py-3.5 px-4">Validity Period</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Approver</th>
                {canManage && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="py-10 text-center text-stone-400 text-xs">
                    Loading allocations...
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <CalendarRange className="w-8 h-8 text-stone-200" strokeWidth={1.5} />
                      <p className="text-xs font-medium">No allocations found.</p>
                      {canManage && (
                        <button
                          onClick={() => setModalOpen(true)}
                          className="mt-1 text-xs text-teal-700 hover:underline cursor-pointer"
                        >
                          Create the first allocation
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-stone-800 text-xs">
                      {a.employeeName}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 text-xs">{a.timeOffTypeName}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-stone-900 text-xs">
                      {a.allocatedUnits}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-500">
                      {a.validFrom} → {a.validTo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_STYLES[a.status] ?? STATUS_STYLES["DRAFT"]
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-stone-500">
                      {a.approverName ?? <span className="text-stone-300">—</span>}
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-center">
                        {a.status === "CONFIRM" ? (
                          <button
                            onClick={() => handleApprove(a.id)}
                            disabled={approvingId === a.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg shadow-xs disabled:opacity-60 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                            {approvingId === a.id ? "Approving..." : "Approve"}
                          </button>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
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

      {/* Count */}
      {!loading && allocations.length > 0 && (
        <p className="text-xs text-stone-400 text-right">{allocations.length} allocation(s) total</p>
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
