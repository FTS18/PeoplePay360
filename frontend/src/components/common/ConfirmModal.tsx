"use client";

import React from "react";
import { Modal } from "@/components/common/Modal";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Sensitive Action",
  description = "Are you sure you want to perform this sensitive action? This operation cannot be undone.",
  confirmLabel = "Confirm Delete",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />,
          iconBg: "bg-rose-500/15 border-rose-500/20 text-rose-600",
          buttonBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />,
          iconBg: "bg-amber-500/15 border-amber-500/20 text-amber-600",
          buttonBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-xs",
        };
      default:
        return {
          icon: <ShieldAlert className="h-5 w-5 text-teal-600 dark:text-teal-400" strokeWidth={1.75} />,
          iconBg: "bg-teal-500/15 border-teal-500/20 text-teal-600",
          buttonBg: "bg-teal-600 hover:bg-teal-700 text-white shadow-xs",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4 p-1">
        <div className="flex items-start gap-3.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${styles.iconBg}`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/70">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-all apple-press cursor-pointer border border-border"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all apple-press cursor-pointer disabled:opacity-50 ${styles.buttonBg}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
