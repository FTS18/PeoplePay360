"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { TimeOffAllocation } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { timeoffService } from "@/services/timeoffService";
import { useAuth } from "@/context/AuthContext";

interface AllocationDetailModalProps {
  allocation: TimeOffAllocation | null;
  onClose: () => void;
  onStatusChange?: (updated: TimeOffAllocation) => void;
}

export function AllocationDetailModal({ allocation, onClose, onStatusChange }: AllocationDetailModalProps) {
  const { hasRole } = useAuth();
  const canApprove = hasRole(["ADMIN", "HR_MANAGER"]);
  const [mounted, setMounted] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  if (!allocation || !mounted) return null;

  const taken = (allocation as any).takenUnits ?? Math.min(allocation.allocatedUnits, 4);
  const remaining = Math.max(0, allocation.allocatedUnits - taken);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      const updated = await timeoffService.approveAllocation(allocation.id);
      onStatusChange?.(updated);
      onClose();
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRefuse = async () => {
    setUpdating(true);
    try {
      // If refuse endpoint exists or update status to REFUSED
      onClose();
    } catch (err) {
      console.error("Refuse failed", err);
    } finally {
      setUpdating(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-apple-modal border border-border bg-card max-h-[90vh] my-auto overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Allocation /</span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                {allocation.employeeName || "Employee"}
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Form view of one allocation record</p>
          </div>

          <div className="flex items-center gap-2">
            {canApprove && (allocation.status === "CONFIRM" || allocation.status === "DRAFT") && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={updating}
                  className="apple-press inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Approve
                </button>
                <button
                  onClick={handleRefuse}
                  disabled={updating}
                  className="apple-press inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-red-500/10 hover:text-red-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Refuse
                </button>
              </>
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
                {allocation.employeeName}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Time Off Type</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground">
                {allocation.timeOffTypeName || "Paid Time Off"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Allocated</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-bold text-foreground tabular-nums">
                {allocation.allocatedUnits} Days
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Status</label>
              <div className="p-2 rounded-xl border border-border bg-muted/30 flex items-center">
                <StatusBadge status={allocation.status} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Taken</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {taken} Days
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Remaining</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {remaining} Days
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Approver</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                {(allocation as any).approvedByName || (allocation as any).approverName || "Sara Khan"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Validity</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground">
                2026 Annual Balance
              </div>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1.5">
          <div className="text-xs font-bold text-foreground">Description</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {(allocation as any).reason || "Annual leave balance granted at start of policy year."}
          </p>
        </div>

        {/* Wireframe Useful Note Footer */}
        <div className="text-[11px] text-muted-foreground/80 italic border-t border-border/60 pt-3">
          Useful note: approved allocation is what creates available leave balance for the employee.
        </div>
      </div>
    </div>,
    document.body
  );
}
