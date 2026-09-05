"use client";

import React, { useState } from "react";
import { X, CalendarDays, ShieldCheck } from "lucide-react";
import { timeoffService } from "@/services/timeoffService";
import { TimeOffType } from "@/types";
import { Modal } from "@/components/common/Modal";

interface CreateTimeOffTypeModalProps {
  typeToEdit?: TimeOffType | null;
  onClose: () => void;
  onSuccess: (savedType: TimeOffType) => void;
}

export function CreateTimeOffTypeModal({ typeToEdit, onClose, onSuccess }: CreateTimeOffTypeModalProps) {
  const [name, setName] = useState(typeToEdit?.name || "");
  const [code, setCode] = useState(typeToEdit?.code || "");
  const [unit, setUnit] = useState<"DAYS" | "HOURS">(typeToEdit?.unit || "DAYS");
  const [requiresAllocation, setRequiresAllocation] = useState(typeToEdit ? typeToEdit.requiresAllocation : true);
  const [isPaid, setIsPaid] = useState(typeToEdit ? (typeToEdit.isPaid !== false) : true);
  const [colorCode, setColorCode] = useState(typeToEdit?.colorCode || "#0d9488");
  const [active, setActive] = useState(typeToEdit ? (typeToEdit.active !== false) : true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Please provide both type name and code.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Partial<TimeOffType> = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        unit,
        requiresAllocation,
        isPaid,
        colorCode,
        active,
      };

      const saved = typeToEdit
        ? await timeoffService.updateType(typeToEdit.id, payload)
        : await timeoffService.createType(payload);

      onSuccess(saved);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save time off type.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={typeToEdit ? "Edit Time Off Type" : "Create Time Off Type"}
      subtitle={typeToEdit ? "Update entitlement parameters in database" : "Configure new leave policy entitlement rules"}
      maxWidth="md"
    >
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Type Name *</label>
            <input
              type="text"
              placeholder="e.g. Parental Leave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Code *</label>
            <input
              type="text"
              placeholder="e.g. PARENTAL"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Entitlement Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "DAYS" | "HOURS")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="DAYS">Days</option>
              <option value="HOURS">Hours</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Badge Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="h-9 w-12 rounded-xl border border-border cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{colorCode}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={requiresAllocation}
              onChange={(e) => setRequiresAllocation(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <span>Requires Annual Allocation Quota</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
            />
            <span>Paid Time Off (Unchecked = Unpaid Leave)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted transition-colors apple-press cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors apple-press disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Time Off Type"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
