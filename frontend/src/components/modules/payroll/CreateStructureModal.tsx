"use client";

import React, { useState } from "react";
import { X, Layers } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { SalaryStructure } from "@/types";
import { Modal } from "@/components/common/Modal";

interface CreateStructureModalProps {
  onClose: () => void;
  onSuccess: (newStructure: SalaryStructure) => void;
}

export function CreateStructureModal({ onClose, onSuccess }: CreateStructureModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Please provide structure name and code.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await apiClient.post<SalaryStructure>("/payroll/structures", {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        rules: [],
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create salary structure.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="New Salary Structure"
      subtitle="Configure new compensation rule container"
      maxWidth="md"
    >
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Structure Name *</label>
          <input
            type="text"
            placeholder="e.g. Executive Salary Model"
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
            placeholder="e.g. EXEC_BASE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Description</label>
          <textarea
            placeholder="Operational scope of this structure..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted apple-press cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs apple-press disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Creating..." : "Save Structure"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
