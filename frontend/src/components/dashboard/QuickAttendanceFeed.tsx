import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { ROUTES } from "@/config/routes";
import { formatTime } from "@/utils/format";

interface AttendanceRecord {
  id: string;
  employeeCode: string;
  name: string;
  checkIn: string;
  checkOut?: string;
  status: string;
}

interface QuickAttendanceFeedProps {
  records: AttendanceRecord[];
}

export function QuickAttendanceFeed({ records }: QuickAttendanceFeedProps) {
  const columns: Column<AttendanceRecord>[] = [
    {
      header: "Employee",
      width: "40%",
      render: (r) => <EmployeeCell name={r.name} subtext={r.employeeCode} />,
    },
    {
      header: "Check In",
      width: "20%",
      render: (r) => (
        <span className="tabular-nums text-[var(--foreground)] font-medium" suppressHydrationWarning>
          {formatTime(r.checkIn)}
        </span>
      ),
    },
    {
      header: "Check Out",
      width: "20%",
      render: (r) => (
        <span className="tabular-nums text-[var(--muted-foreground)]" suppressHydrationWarning>
          {formatTime(r.checkOut)}
        </span>
      ),
    },
    {
      header: "Status",
      width: "20%",
      align: "center",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <Table
      header={
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Today&apos;s Attendance</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Live workforce check-ins</p>
          </div>
          <Link
            href={ROUTES.ATTENDANCE}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors apple-press"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      }
      columns={columns}
      data={records}
      minWidth="min-w-[500px]"
      emptyMessage="No attendance records logged for today yet."
      emptySubtitle="Employees will appear here once check-in transactions are registered."
    />
  );
}
