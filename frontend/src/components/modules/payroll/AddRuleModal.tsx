"use client";

import React, { useState } from "react";
import { X, Plus, Binary } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { SalaryRule } from "@/types";
import { Modal } from "@/components/common/Modal";

interface AddRuleModalProps {
  structureId: string;
  onClose: () => void;
  onSuccess: (newRule: SalaryRule) => void;
}

export function AddRuleModal({ structureId, onClose, onSuccess }: AddRuleModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<"BASIC" | "ALLOWANCE" | "GROSS" | "DEDUCTION" | "NET">("ALLOWANCE");
  const [sequence, setSequence] = useState(20);
  const [computationType, setComputationType] = useState<"FIXED" | "PERCENTAGE" | "FORMULA">("FIXED");
  const [fixedAmount, setFixedAmount] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [percentageBaseCode, setPercentageBaseCode] = useState("BASIC");
  const [formula, setFormula] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Please specify rule name and code.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        category,
        sequence,
        computationType,
      };

      if (computationType === "FIXED") {
        payload.fixedAmount = fixedAmount;
      } else if (computationType === "PERCENTAGE") {
        payload.percentage = percentage;
        payload.percentageBaseCode = percentageBaseCode.toUpperCase();
      } else if (computationType === "FORMULA") {
        payload.formula = formula.trim();
      }

      const created = await apiClient.post<SalaryRule>(`/payroll/structures/${structureId}/rules`, payload);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to add salary rule.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Add Salary Rule"
      subtitle="Configure dynamic calculation rule step"
      maxWidth="lg"
    >
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Rule Name *</label>
            <input
              type="text"
              placeholder="e.g. Medical Allowance"
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
              placeholder="e.g. MED_ALLOW"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              <option value="BASIC">BASIC</option>
              <option value="ALLOWANCE">ALLOWANCE</option>
              <option value="GROSS">GROSS</option>
              <option value="DEDUCTION">DEDUCTION</option>
              <option value="NET">NET</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Execution Sequence</label>
            <input
              type="number"
              value={sequence}
              onChange={(e) => setSequence(parseInt(e.target.value, 10) || 10)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Computation Method</label>
          <select
            value={computationType}
            onChange={(e) => setComputationType(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="FIXED">Fixed Amount</option>
            <option value="PERCENTAGE">Percentage of Base Rule</option>
            <option value="FORMULA">Custom Formula Expression</option>
          </select>
        </div>

        {computationType === "FIXED" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Fixed Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="2500"
              value={fixedAmount}
              onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
        )}

        {computationType === "PERCENTAGE" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="40"
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Base Rule Code</label>
              <input
                type="text"
                placeholder="BASIC"
                value={percentageBaseCode}
                onChange={(e) => setPercentageBaseCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
          </div>
        )}

        {computationType === "FORMULA" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Formula Expression</label>
            <input
              type="text"
              placeholder="BASIC * 0.40"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
        )}

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
            {saving ? "Adding..." : "Save Rule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
