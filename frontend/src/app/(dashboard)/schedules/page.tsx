"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  ArrowLeft,
  CalendarDays,
  List as ListIcon,
  Search,
  Filter,
  Columns,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { scheduleService, CreateSchedulePayload, ScheduleLinePayload } from "@/services/scheduleService";
import { apiClient } from "@/services/apiClient";
import { WorkingSchedule } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

interface DayRow {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakHours: number;
  workHours: number;
}

import { RoleGuard } from "@/components/common/RoleGuard";

export default function SchedulesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="Working Schedules">
      <SchedulesContent />
    </RoleGuard>
  );
}

function SchedulesContent() {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]);

  const [schedules, setSchedules] = useState<WorkingSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  
  // Selected schedule for Form View (null = list view)
  const [selectedSchedule, setSelectedSchedule] = useState<WorkingSchedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form View State
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("OXP Pvt Ltd");
  const [formType, setFormType] = useState<"STANDARD" | "SHIFT" | "FLEXIBLE">("STANDARD");
  const [formDays, setFormDays] = useState<DayRow[]>([]);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
    loadSchedules();
  }, [loadSchedules]);

  // Open Form View for an existing schedule
  const handleOpenForm = (sched: WorkingSchedule) => {
    setSelectedSchedule(sched);
    setIsCreating(false);
    setFormError(null);
    setFormName(sched.name);
    setFormCompany("OXP Pvt Ltd");
    setFormType((sched.type as any) || "STANDARD");

    const lines: DayRow[] = (sched.lines || []).map((l) => {
      const dayName = l.dayOfWeek.charAt(0) + l.dayOfWeek.slice(1).toLowerCase();
      return {
        id: l.id,
        dayOfWeek: dayName,
        startTime: l.startTime?.slice(0, 5) || "09:00",
        endTime: l.endTime?.slice(0, 5) || "18:00",
        breakHours: l.breakHours ?? 1,
        workHours: l.workHours ?? 8,
      };
    });

    if (lines.length === 0) {
      // Default 5-day pattern
      const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => ({
        dayOfWeek: d,
        startTime: "09:00",
        endTime: "18:00",
        breakHours: 1,
        workHours: 8,
      }));
      setFormDays(defaultDays);
    } else {
      setFormDays(lines);
    }
  };

  // Open Form View for New Schedule
  const handleNewSchedule = () => {
    setSelectedSchedule(null);
    setIsCreating(true);
    setFormError(null);
    setFormName("40 Hours / Week");
    setFormCompany("OXP Pvt Ltd");
    setFormType("STANDARD");
    
    const defaultDays: DayRow[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => ({
      dayOfWeek: d,
      startTime: "09:00",
      endTime: "18:00",
      breakHours: 1,
      workHours: 8,
    }));
    setFormDays(defaultDays);
  };

  const handleBackToList = () => {
    setSelectedSchedule(null);
    setIsCreating(false);
    setFormError(null);
  };

  const calculateHours = (start: string, end: string, breakH: number): number => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMins = sh * 60 + (sm || 0);
    const endMins = eh * 60 + (em || 0);
    const diff = (endMins - startMins) / 60;
    return Math.max(0, diff - breakH);
  };

  const handleDayChange = (index: number, field: keyof DayRow, value: any) => {
    setFormDays((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      if (field === "startTime" || field === "endTime" || field === "breakHours") {
        updated.workHours = calculateHours(updated.startTime, updated.endTime, Number(updated.breakHours || 0));
      }
      next[index] = updated;
      return next;
    });
  };

  const handleAddDay = () => {
    const usedDays = formDays.map((d) => d.dayOfWeek);
    const available = DAYS.find((d) => !usedDays.includes(d)) || "Monday";
    setFormDays((prev) => [
      ...prev,
      {
        dayOfWeek: available,
        startTime: "09:00",
        endTime: "18:00",
        breakHours: 1,
        workHours: 8,
      },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    setFormDays((prev) => prev.filter((_, i) => i !== index));
  };

  const totalWeeklyHours = useMemo(() => {
    return formDays.reduce((acc, d) => acc + (d.workHours || 0), 0);
  }, [formDays]);

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      setFormError("Schedule name is required");
      return;
    }
    if (formDays.length === 0) {
      setFormError("At least one working day must be configured");
      return;
    }

    setFormSaving(true);
    setFormError(null);

    const payloadLines: ScheduleLinePayload[] = formDays.map((d) => ({
      dayOfWeek: d.dayOfWeek.toUpperCase(),
      startTime: d.startTime.length === 5 ? `${d.startTime}:00` : d.startTime,
      endTime: d.endTime.length === 5 ? `${d.endTime}:00` : d.endTime,
      breakHours: Number(d.breakHours) || 0,
    }));

    const payload: CreateSchedulePayload = {
      name: formName.trim(),
      type: formType,
      lines: payloadLines,
    };

    try {
      if (selectedSchedule?.id && !isCreating) {
        const updated = await scheduleService.update(selectedSchedule.id, payload);
        showToast("Working schedule updated successfully");
        setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await scheduleService.create(payload);
        showToast("Working schedule created successfully");
        setSchedules((prev) => [created, ...prev]);
      }
      handleBackToList();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save schedule");
    } finally {
      setFormSaving(false);
    }
  };

  const filteredSchedules = useMemo(() => {
    if (!search.trim()) return schedules;
    const q = search.toLowerCase();
    return schedules.filter((s) => s.name.toLowerCase().includes(q));
  }, [schedules, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-card text-foreground text-xs font-semibold px-4 py-2.5 rounded-full shadow-apple-modal backdrop-blur-md border border-border animate-in fade-in slide-in-from-bottom-2">
          <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" strokeWidth={1.75} />
          <span>{toast}</span>
        </div>
      )}

      {/* VIEW 1: LIST VIEW (IMAGE 1 LEFT) */}
      {!selectedSchedule && !isCreating && (
        <div className="space-y-4">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              {canManage && (
                <button
                  onClick={handleNewSchedule}
                  className="apple-press inline-flex items-center gap-1.5 rounded-xl bg-teal-600 dark:bg-teal-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  New Schedule
                </button>
              )}
              <h1 className="text-base font-bold text-foreground tracking-tight">Working Schedules</h1>
            </div>

            {/* List / Calendar Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1 text-xs">
              <button
                onClick={() => setActiveTab("list")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "list" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                List
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "calendar" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                Calendar
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schedules..."
                className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            <button className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              Filter
            </button>

            <button className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs">
              <Columns className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              Columns
            </button>
          </div>

          {/* Schedules Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-apple-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Schedule Name</th>
                    <th className="py-3 px-4">Days / Week</th>
                    <th className="py-3 px-4">Hours / Week</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSchedules.map((sched) => {
                    const daysCount = sched.lines?.length || 5;
                    const hoursCount = sched.totalWeeklyHours || 40;
                    return (
                      <tr
                        key={sched.id}
                        onClick={() => handleOpenForm(sched)}
                        className="hover:bg-muted/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4 font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400">
                          {sched.name}
                        </td>
                        <td className="py-3 px-4 tabular-nums text-muted-foreground font-medium">
                          {daysCount}
                        </td>
                        <td className="py-3 px-4 tabular-nums font-semibold text-foreground">
                          {hoursCount}h
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          OXP Pvt Ltd
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              sched.active !== false
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                            }`}
                          >
                            {sched.active !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSchedules.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No working schedules found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground italic">
            Select a schedule to open its Form view.
          </div>
        </div>
      )}

      {/* VIEW 2: FORM VIEW (IMAGE 1 RIGHT) */}
      {(selectedSchedule || isCreating) && (
        <div className="space-y-6">
          {/* Back & Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="apple-press flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Back to list
              </button>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                {formName || "New Working Schedule"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="apple-press rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
              >
                Cancel
              </button>
              {canManage && (
                <button
                  onClick={handleSaveForm}
                  disabled={formSaving}
                  className="apple-press inline-flex items-center gap-1.5 rounded-xl bg-teal-600 dark:bg-teal-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-60"
                >
                  {formSaving ? "Saving..." : "Save Schedule"}
                </button>
              )}
            </div>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          {/* Form Content Sheet */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-apple-sm space-y-6">
            {/* Schedule Configuration Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Schedule Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 40 Hours / Week"
                  className="w-full rounded-xl border border-border bg-background py-2 px-3 text-xs font-semibold text-foreground focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Company</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Days per Week</label>
                <div className="p-2 rounded-xl border border-border bg-muted/30 font-bold tabular-nums text-foreground">
                  {formDays.length}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Hours per Week</label>
                <div className="p-2 rounded-xl border border-border bg-muted/30 font-bold tabular-nums text-foreground">
                  {totalWeeklyHours}h
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Timezone</label>
                <div className="p-2 rounded-xl border border-border bg-muted/30 text-muted-foreground font-medium">
                  Asia/Kolkata (Company timezone)
                </div>
              </div>
            </div>

            {/* Weekly Schedule Configuration */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground tracking-tight">Weekly Schedule</h2>
                <button
                  type="button"
                  onClick={handleAddDay}
                  className="apple-press inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
                  Add Day
                </button>
              </div>

              {/* Day Rows Table */}
              <div className="rounded-2xl border border-border overflow-hidden bg-background">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-2.5 px-3">Day</th>
                      <th className="py-2.5 px-3">Start Time</th>
                      <th className="py-2.5 px-3">End Time</th>
                      <th className="py-2.5 px-3">Break</th>
                      <th className="py-2.5 px-3">Hours</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {formDays.map((day, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2 px-3">
                          <select
                            value={day.dayOfWeek}
                            onChange={(e) => handleDayChange(idx, "dayOfWeek", e.target.value)}
                            className="rounded-lg border border-border bg-card py-1 px-2 text-xs font-semibold text-foreground focus:outline-none"
                          >
                            {DAYS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleDayChange(idx, "startTime", e.target.value)}
                            className="rounded-lg border border-border bg-card py-1 px-2 text-xs tabular-nums text-foreground focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleDayChange(idx, "endTime", e.target.value)}
                            className="rounded-lg border border-border bg-card py-1 px-2 text-xs tabular-nums text-foreground focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="4"
                              step="0.5"
                              value={day.breakHours}
                              onChange={(e) => handleDayChange(idx, "breakHours", Number(e.target.value))}
                              className="w-14 rounded-lg border border-border bg-card py-1 px-2 text-xs tabular-nums text-foreground focus:outline-none"
                            />
                            <span className="text-muted-foreground text-[11px]">h</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 tabular-nums font-bold text-foreground">
                          {day.workHours}h
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(idx)}
                            className="p-1 rounded-md text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            aria-label="Remove Day"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Weekly Hours Summary */}
              <div className="flex justify-end items-center gap-3 pt-2 text-xs">
                <span className="text-muted-foreground font-medium">Total Weekly Hours:</span>
                <span className="text-base font-bold tabular-nums text-foreground">{totalWeeklyHours}h</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground italic">
              Use this schedule as the employee/contract working pattern.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
