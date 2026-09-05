"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Clock, Edit2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { AttendanceRecord } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatTime } from "@/utils/format";

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onOpenEdit?: (record: AttendanceRecord) => void;
}

export function AttendanceDetailModal({ record, onClose, onOpenEdit }: AttendanceDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!record || !mounted) return null;

  const worked = Number(record.workedHours) || 0;
  const expected = Number(record.expectedHours) || 8.0;
  const overtime = Math.max(0, worked - expected);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-apple-modal border border-border bg-card max-h-[90vh] my-auto overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Attendance /</span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                {record.employeeName || "Employee"} / <span className="tabular-nums">{record.date}</span>
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Form view of one attendance record</p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(record);
                }}
                className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                EDIT
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors apple-press cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* 2-Column Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Employee</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                {record.employeeName}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Check In</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground tabular-nums">
                {record.date} {formatTime(record.checkIn) || "—"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Check Out</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground tabular-nums">
                {record.date} {formatTime(record.checkOut) || "—"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Worked Hours</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-bold text-foreground tabular-nums">
                {worked.toFixed(2)} hrs
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Department</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                Finance
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Manager</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                Sara Khan
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Status</label>
              <div className="p-2 rounded-xl border border-border bg-muted/30 flex items-center">
                <StatusBadge status={record.status} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Overtime</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                {overtime > 0 ? `${overtime.toFixed(2)} hrs` : "0.00 hrs"}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Box */}
        <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1.5">
          <div className="text-xs font-bold text-foreground">Notes</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {record.manualOverride
              ? `Manually adjusted by ${record.reviewedByName || "authorized user"}. Reason: ${record.overrideReason || "Audit correction"}`
              : "System-generated from check in/out or manually corrected by an authorized user."}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
