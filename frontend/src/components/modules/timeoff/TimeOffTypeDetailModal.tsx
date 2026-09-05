"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Pencil } from "lucide-react";
import { TimeOffType } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuth } from "@/context/AuthContext";

interface TimeOffTypeDetailModalProps {
  type: TimeOffType | null;
  onClose: () => void;
  onEdit?: (type: TimeOffType) => void;
}

export function TimeOffTypeDetailModal({ type, onClose, onEdit }: TimeOffTypeDetailModalProps) {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER"]);
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

  if (!type || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />
      <div className="apple-glass-modal apple-specular rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-apple-modal border border-border bg-card max-h-[90vh] my-auto overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Time Off Type /</span>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                {type.name || "Time Off Type"}
              </h2>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Form view of one time off type</p>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                onClick={() => {
                  onClose();
                  onEdit?.(type);
                }}
                className="apple-press inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
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
              <label className="text-muted-foreground font-medium">Type Name</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                {type.name}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Unit</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground">
                {type.unit || "Days"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Requires Allocation</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground">
                {type.requiresAllocation ? "Yes" : "No"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Active</label>
              <div className="p-2 rounded-xl border border-border bg-muted/30 flex items-center">
                <StatusBadge status={type.active !== false ? "ACTIVE" : "INACTIVE"} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Approval</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                Manager
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Payroll / Work Entry</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-medium text-foreground">
                {type.payrollAffecting ? "Affects Payroll" : "Leave Work Entry"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Display Color</label>
              <div className="p-2.5 rounded-xl border border-border bg-muted/30 flex items-center gap-2 font-medium text-foreground">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: type.colorCode || "#0284c7" }}
                />
                <span>{type.colorCode || "Blue"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Notes Box */}
        <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1.5">
          <div className="text-xs font-bold text-foreground">Configuration Notes</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Standard annual leave. Balance comes from approved allocations.
          </p>
        </div>

        {/* Wireframe Useful Note Footer */}
        <div className="text-[11px] text-muted-foreground/80 italic border-t border-border/60 pt-3">
          Useful note: Time Off Type drives approval behavior and whether a request needs an allocation.
        </div>
      </div>
    </div>,
    document.body
  );
}
