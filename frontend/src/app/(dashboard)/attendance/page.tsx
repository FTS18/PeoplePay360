"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { UserCheck, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { attendanceService } from "@/services/attendanceService";
import { AttendanceRecord } from "@/types";
import { AttendancePunchClock } from "@/components/modules/attendance/AttendancePunchClock";
import { AttendanceTable } from "@/components/modules/attendance/AttendanceTable";
import { AttendanceOverrideModal } from "@/components/modules/attendance/AttendanceOverrideModal";
import { useAuth } from "@/context/AuthContext";

import { apiClient } from "@/services/apiClient";

export default function AttendancePage() {
  const { user, role } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const displayedRecords = React.useMemo(() => {
    if (role === "EMPLOYEE" && user) {
      const fullName = `${user.firstName} ${user.lastName}`.trim().toLowerCase();
      return records.filter(
        (r) =>
          r.employeeId === user.id ||
          (r.employeeName && r.employeeName.toLowerCase().includes(fullName)) ||
          (r.employeeName && r.employeeName.toLowerCase().includes(user.firstName.toLowerCase()))
      );
    }
    return records;
  }, [records, role, user]);

  const fetchRecords = async () => {
    if (records.length === 0) setLoading(true);
    try {
      const res = await attendanceService.getAll(0, 25, employeeIdParam || undefined);
      if (res?.content) setRecords(res.content);
    } catch (err) {
      console.error("Failed to load attendance logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams({ page: "0", size: "25" });
    if (employeeIdParam) params.append("employeeId", employeeIdParam);
    const cached = apiClient.getFromCache<any>(`/attendance?${params.toString()}`);
    if (cached?.content && cached.content.length > 0) {
      setRecords(cached.content);
      setLoading(false);
    }
    fetchRecords();
  }, [employeeIdParam]);

  const handleOverrideSaved = (updated: AttendanceRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const presentCount = displayedRecords.filter((r) => r.status === "PRESENT").length;
  const exceptionCount = displayedRecords.filter((r) => r.status === "EXCEPTION" || r.status === "HALF_DAY").length;
  const totalHours = displayedRecords.reduce((acc, r) => acc + (Number(r.workedHours) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Attendance & Shifts</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time biometric punch terminal, scheduled shift compliance, and supervisor audit logs.
          </p>
        </div>
        <button
          onClick={fetchRecords}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          Refresh Feed
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Logged Entries</span>
            <UserCheck className="w-4 h-4 text-teal-600" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{records.length}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">{presentCount} Regular Shifts</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Exceptions & Half-Days</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{exceptionCount}</div>
          <div className="text-xs text-stone-500 mt-1 font-medium">Flagged for Audit</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Cumulative Worked Hours</span>
            <Clock className="w-4 h-4 text-teal-700" strokeWidth={1.5} />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{totalHours.toFixed(1)}h</div>
          <div className="text-xs text-stone-500 mt-1 font-medium">Standard 8h Shift Basis</div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4">
          <AttendancePunchClock onPunchSuccess={fetchRecords} />
        </div>
        <div className="lg:col-span-8">
          <AttendanceTable
            records={displayedRecords}
            onOpenOverride={(rec) => setSelectedRecord(rec)}
          />
        </div>
      </div>

      {/* Audit Override Modal */}
      {selectedRecord && (
        <AttendanceOverrideModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onSaved={handleOverrideSaved}
        />
      )}
    </div>
  );
}
