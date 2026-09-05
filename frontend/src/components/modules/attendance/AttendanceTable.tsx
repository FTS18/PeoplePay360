"use client";

import React from "react";
import { Edit2, ShieldAlert } from "lucide-react";
import { AttendanceRecord } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatTime } from "@/utils/format";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onOpenOverride: (record: AttendanceRecord) => void;
  onRowClick?: (record: AttendanceRecord) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function AttendanceTable({ records, onOpenOverride, onRowClick, pagination }: AttendanceTableProps) {
  const { hasRole } = useAuth();
  const canOverride = hasRole(["ADMIN", "HR_MANAGER"]);

  const columns: Column<AttendanceRecord>[] = [
    {
      header: "Date",
      width: "12%",
      render: (r) => (
        <span className="text-[var(--foreground)] tabular-nums text-xs font-medium">
          {r.date}
        </span>
      ),
    },
    {
      header: "Employee",
      width: "28%",
      render: (r) => (
        <EmployeeCell name={r.employeeName} subtext={r.employeeCode} />
      ),
    },
    {
      header: "Check In",
      width: "14%",
      render: (r) => (
        <span className="text-[var(--foreground)] tabular-nums text-xs font-medium">
          {formatTime(r.checkIn)}
        </span>
      ),
    },
    {
      header: "Check Out",
      width: "14%",
      render: (r) => (
        <span className="text-[var(--muted-foreground)] tabular-nums text-xs">
          {formatTime(r.checkOut)}
        </span>
      ),
    },
    {
      header: "Worked",
      width: "10%",
      align: "right",
      render: (r) => (
        <span className="font-semibold text-[var(--foreground)] tabular-nums text-xs">
          {r.workedHours != null ? `${Number(r.workedHours).toFixed(2)}h` : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      width: "14%",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={r.status} />
          {r.manualOverride && (
            <span
              title={`Override: ${r.overrideReason || "Approved manual adjustment"}`}
              className="text-amber-500 cursor-help"
            >
              <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.5} />
            </span>
          )}
        </div>
      ),
    },
  ];

  if (canOverride) {
    columns.push({
      header: "Audit",
      width: "8%",
      align: "center",
      render: (r) => (
        <button
          onClick={() => onOpenOverride(r)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-teal-600 dark:hover:text-teal-400 hover:bg-[var(--muted)] border border-[var(--border)] transition-all cursor-pointer apple-press"
        >
          <Edit2 className="w-3 h-3" strokeWidth={1.5} />
          Override
        </button>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      data={records}
      onRowClick={onRowClick}
      pagination={pagination}
      minWidth="min-w-[680px]"
      emptyMessage="No attendance logs."
      emptySubtitle="Records are generated from check-ins or bulk HR imports."
    />
  );
}
