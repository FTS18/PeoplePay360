"use client";

import React from "react";
import { Edit2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { AttendanceRecord, AttendanceStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onOpenOverride: (record: AttendanceRecord) => void;
}

export function AttendanceTable({ records, onOpenOverride }: AttendanceTableProps) {
  const { hasRole } = useAuth();
  const canOverride = hasRole(["ADMIN", "HR_MANAGER"]);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LATE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "HALF_DAY":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "EXCEPTION":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50/75 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Check In</th>
              <th className="py-3.5 px-4">Check Out</th>
              <th className="py-3.5 px-4 text-right">Worked</th>
              <th className="py-3.5 px-4">Status</th>
              {canOverride && <th className="py-3.5 px-4 text-center">Audit</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={canOverride ? 7 : 6} className="py-8 text-center text-stone-400">
                  No attendance records logged for this period.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-900">{r.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-800">{r.employeeName || "Employee"}</div>
                    <div className="text-xs text-stone-400">{r.employeeCode || "EMP"}</div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">{formatTime(r.checkIn)}</td>
                  <td className="py-3.5 px-4 text-stone-600">{formatTime(r.checkOut)}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-stone-800">
                    {r.workedHours != null ? `${Number(r.workedHours).toFixed(2)}h` : "-"}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                      {r.manualOverride && (
                        <span
                          title={`Override: ${r.overrideReason || "Approved manual adjustment"}`}
                          className="text-amber-600 cursor-help"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </span>
                      )}
                    </div>
                  </td>
                  {canOverride && (
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenOverride(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 hover:text-teal-800 hover:bg-teal-50 border border-stone-200 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                        Override
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
