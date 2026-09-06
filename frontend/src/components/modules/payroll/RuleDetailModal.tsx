"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Edit3 } from "lucide-react";
import { SalaryRule } from "@/types";

interface RuleDetailModalProps {
  rule: SalaryRule;
  structureName?: string;
  onClose: () => void;
  onSave?: (updated: SalaryRule) => void;
}

export function RuleDetailModal({
  rule,
  structureName = "Regular Salary",
  onClose,
  onSave,
}: RuleDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"FIXED" | "PERCENTAGE" | "FORMULA">("PERCENTAGE");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header matching Wireframe 6B */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Salary Rule /</span>
              <h2 className="text-lg font-bold text-foreground">{rule.name}</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Form view</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{isEditing ? "View" : "EDIT"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Form Fields Grid matching Wireframe 6B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Rule Name</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue={rule.name}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Salary Structure</label>
              <input
                type="text"
                readOnly
                value={structureName}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/50 text-foreground font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Code</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue={rule.code}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Computation</label>
              <select
                disabled={!isEditing}
                defaultValue={rule.computationType || "PERCENTAGE"}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-medium focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage of Wage</option>
                <option value="FIXED">Fixed Amount</option>
                <option value="FORMULA">Formula / Expression</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue={rule.category}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Percentage / Value</label>
              <input
                type="text"
                readOnly={!isEditing}
                defaultValue={rule.percentage ? `${rule.percentage}%` : rule.fixedAmount ? `₹${rule.fixedAmount}` : "50%"}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Sequence</label>
              <input
                type="number"
                readOnly={!isEditing}
                defaultValue={rule.sequence}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Quantity</label>
              <input
                type="number"
                readOnly={!isEditing}
                defaultValue={1}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/30 text-foreground font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Computation Tabs matching Wireframe 6B */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="text-xs font-bold text-foreground">Computation options from the source</h3>
            
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <button
                onClick={() => setActiveTab("FIXED")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "FIXED" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Fixed Amount
              </button>
              <button
                onClick={() => setActiveTab("PERCENTAGE")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "PERCENTAGE" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Percentage of Wage
              </button>
              <button
                onClick={() => setActiveTab("FORMULA")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === "FORMULA" ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Formula Expression
              </button>
            </div>

            {/* Expression Box */}
            <div className="p-4 rounded-xl border border-border bg-muted/40 font-mono text-xs text-foreground space-y-1">
              <div className="text-muted-foreground text-[11px]">Example expression:</div>
              <div className="text-teal-600 dark:text-teal-400 font-semibold">
                {activeTab === "PERCENTAGE" && `result = contract.wage * 0.50`}
                {activeTab === "FIXED" && `result = 2000.00`}
                {activeTab === "FORMULA" && `result = BASIC * 0.40`}
              </div>
            </div>
          </div>
        </div>

        {/* Wireframe Footer Note */}
        <div className="px-6 py-3 border-t border-border bg-muted/20">
          <p className="text-[11px] text-muted-foreground italic">
            Useful note: a Salary Rule needs a clear computation method and category because these drive the lines displayed on the final payslip.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
