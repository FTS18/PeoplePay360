"use client";

import React, { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { AttendanceRecord, AttendanceStatus } from "@/types";
import { attendanceService } from "@/services/attendanceService";

interface AttendanceOverrideModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onSaved: (updated: AttendanceRecord) => void;
}

export function AttendanceOverrideModal({ record, onClose, onSaved }: AttendanceOverrideModalProps) {
  if (!record) return null;

  const [status, setStatus] = useState<AttendanceStatus>(record.status);
  const [workedHours, setWorkedHours] = useState<number>(record.workedHours || 8.0);
  const [reason, setReason] = useState<string>(record.overrideReason || "");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Audit reason is mandatory for compliance.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await attendanceService.overrideRecord(record.id, {
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        workedHours,
        status,
        overrideReason: reason,
      });
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-base font-semibold text-stone-900">Manual Attendance Override</h3>
            <p className="text-xs text-stone-500">
              {record.employeeName || "Employee"} - {record.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Status Classification</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="HALF_DAY">HALF_DAY</option>
              <option value="EXCEPTION">EXCEPTION</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Adjusted Worked Hours</label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="24"
              value={workedHours}
              onChange={(e) => setWorkedHours(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Audit Justification Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Punch terminal glitch at HQ entrance, verified by supervisor badge log."
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs disabled:opacity-60"
            >
              {submitting ? "Committing..." : "Commit Override"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
