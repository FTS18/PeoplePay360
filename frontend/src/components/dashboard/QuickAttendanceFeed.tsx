import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";

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
  return (
    <div className="rounded-2xl border border-[oklch(92%_0.005_240)] bg-white overflow-hidden shadow-xs">
      <div className="flex items-center justify-between p-5 border-b border-[oklch(92%_0.005_240)]">
        <div>
          <h3 className="text-sm font-bold text-[oklch(20%_0.02_240)]">Today&apos;s Attendance</h3>
          <p className="text-xs text-[oklch(50%_0.02_240)]">Live workforce check-ins</p>
        </div>
        <Link
          href={ROUTES.ATTENDANCE}
          className="text-xs font-semibold text-[oklch(35%_0.08_195)] hover:text-[oklch(20%_0.04_195)] hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[oklch(98%_0.005_240)] text-[oklch(50%_0.02_240)] border-b border-[oklch(92%_0.005_240)]">
            <tr>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px]">Employee</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px]">Check In</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px]">Check Out</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(94%_0.005_240)]">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-[oklch(98.5%_0.005_240)] transition-colors">
                <td className="py-3.5 px-5">
                  <div className="font-semibold text-[oklch(20%_0.02_240)]">{r.name}</div>
                  <div className="text-[11px] text-[oklch(50%_0.02_240)]">
                    {r.employeeCode}
                  </div>
                </td>
                <td className="py-3.5 px-5 font-medium text-[oklch(30%_0.02_240)]">{r.checkIn}</td>
                <td className="py-3.5 px-5 text-[oklch(50%_0.02_240)]">
                  {r.checkOut || "-"}
                </td>
                <td className="py-3.5 px-5 text-center">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
