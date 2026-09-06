"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UserCheck, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { attendanceService, AttendanceStats } from "@/services/attendanceService";
import { AttendanceRecord } from "@/types";
import { AttendancePunchClock } from "@/components/modules/attendance/AttendancePunchClock";
import { AttendanceTable } from "@/components/modules/attendance/AttendanceTable";
import { AttendanceOverrideModal } from "@/components/modules/attendance/AttendanceOverrideModal";
import { AttendanceDetailModal } from "@/components/modules/attendance/AttendanceDetailModal";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/apiClient";

function AttendanceContent() {
  const { user, role } = useAuth();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalEntries: 0,
    presentCount: 0,
    exceptionCount: 0,
    totalWorkedHours: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailRecord, setDetailRecord] = useState<AttendanceRecord | null>(null);

  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);

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
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        attendanceService.getAll(pageParam, 25, employeeIdParam || undefined),
        attendanceService.getStats(employeeIdParam || undefined),
      ]);
      if (res?.content) {
        setRecords(res.content);
        setTotalPages(res.totalPages || 0);
      } else if (Array.isArray(res)) {
        setRecords(res);
        setTotalPages(1);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error("Failed to load attendance logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [employeeIdParam, pageParam]);

  const handleOverrideSaved = (updated: AttendanceRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    fetchRecords();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Attendance &amp; Shifts</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time biometric punch terminal, scheduled shift compliance, and supervisor audit logs.
        </p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Logged Entries</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <UserCheck className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div suppressHydrationWarning className="text-2xl font-bold text-foreground mt-2 tabular-nums">{stats.totalEntries.toLocaleString()}</div>
          <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-medium">{stats.presentCount.toLocaleString()} Regular Shifts</div>
        </div>

        <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Exceptions & Half-Days</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div suppressHydrationWarning className="text-2xl font-bold text-foreground mt-2 tabular-nums">{stats.exceptionCount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">Flagged for Supervisor Audit</div>
        </div>

        <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Cumulative Worked Hours</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div suppressHydrationWarning className="text-2xl font-bold text-foreground mt-2 tabular-nums">{Number(stats.totalWorkedHours || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h</div>
          <div className="text-xs text-muted-foreground mt-1 font-medium">Standard 8h Shift Basis</div>
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
            onRowClick={(rec) => setDetailRecord(rec)}
            pagination={{ currentPage: pageParam, totalPages }}
          />
        </div>
      </div>

      {/* Attendance Form View Modal */}
      {detailRecord && (
        <AttendanceDetailModal
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          onOpenEdit={(rec) => setSelectedRecord(rec)}
        />
      )}

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

export default function AttendancePage() {
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
        </div>
      }
    >
      <AttendanceContent />
    </Suspense>
  );
}

