"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, CalendarDays, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { scheduleService } from "@/services/scheduleService";
import { apiClient } from "@/services/apiClient";
import { WorkingSchedule } from "@/types";
import { ScheduleDetailCard } from "@/components/modules/schedule/ScheduleDetailCard";
import { ScheduleFormModal } from "@/components/modules/schedule/ScheduleFormModal";

export default function SchedulesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]);

  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkingSchedule | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadSchedules = useCallback(async () => {
    try {
      const data = await scheduleService.getAll();
      if (Array.isArray(data)) setSchedules(data);
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = apiClient.getFromCache<WorkingSchedule[]>("/schedules");
    if (cached && cached.length > 0) {
      setSchedules(cached);
      setLoading(false);
    }
    loadSchedules();
  }, [loadSchedules]);

  const handleCreate = () => {
    setEditingSchedule(null);
    setModalOpen(true);
  };

  const handleEdit = (schedule: WorkingSchedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this working schedule?")) return;
    try {
      await scheduleService.delete(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      showToast("Working schedule deleted.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete schedule";
      showToast(message);
    }
  };

  const handleSuccess = (saved: WorkingSchedule) => {
    setSchedules((prev) => {
      const index = prev.findIndex((s) => s.id === saved.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    showToast(editingSchedule ? "Schedule updated." : "Schedule created.");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl">
          <ShieldCheck className="w-4 h-4 text-teal-400" strokeWidth={1.5} />
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Working Schedules</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure standard, shift, and flexible working hours used for attendance calculation and payroll proration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSchedules}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          {canManage && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              New Schedule
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-stone-400 text-xs">Loading working schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center">
          <CalendarDays className="w-10 h-10 text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="text-sm font-semibold text-stone-800">No schedules configured</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Set up standard weekly schedules to define expected attendance hours and calculate accurate payroll wages.
          </p>
          {canManage && (
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Create First Schedule
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <ScheduleDetailCard
              key={schedule.id}
              schedule={schedule}
              canManage={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ScheduleFormModal
          schedule={editingSchedule}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
