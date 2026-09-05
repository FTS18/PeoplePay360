"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffType, TimeOffRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  types: TimeOffType[];
  onClose: () => void;
  onSuccess: (request: TimeOffRequest) => void;
}

export function ApplyLeaveModal({ isOpen, types, onClose, onSuccess }: ApplyLeaveModalProps) {
  const { user } = useAuth();
  const [typeId, setTypeId] = useState<string>(types[0]?.id || "");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [units, setUnits] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (!endDate || endDate < val) {
      setEndDate(val);
      setUnits(1);
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate && val >= startDate) {
      const s = new Date(startDate);
      const e = new Date(val);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setUnits(diffDays);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await timeoffService.applyLeave({
        employeeId: user.id,
        timeOffTypeId: typeId || types[0]?.id,
        startDate,
        endDate,
        requestedUnits: units,
        reason,
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-stone-900">Request Time Off</h3>
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
            <label className="block text-xs font-medium text-stone-700 mb-1">Leave Category</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">End Date</label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Duration (Days)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={units}
              onChange={(e) => setUnits(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Reason / Notes</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for manager review..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
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
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
