"use client";

import React, { useState } from "react";
import { CheckSquare, Square, Search, Check } from "lucide-react";
import { Employee } from "@/types";

interface CreatePayrunStaffSelectorProps {
  employees: Employee[];
  selectedEmpIds: string[];
  submitting: boolean;
  onToggleEmp: (id: string) => void;
  onToggleAll: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function CreatePayrunStaffSelector({
  employees,
  selectedEmpIds,
  submitting,
  onToggleEmp,
  onToggleAll,
  onBack,
  onSubmit,
}: CreatePayrunStaffSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = employees.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    return (
      name.includes(q) ||
      e.employeeCode?.toLowerCase().includes(q) ||
      e.jobPosition?.toLowerCase().includes(q)
    );
  });

  const allSelected = employees.length > 0 && selectedEmpIds.length === employees.length;

  return (
    <div className="mt-4 space-y-4">
      {/* Top Search & Counter Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
          />
        </div>

        <span className="text-xs font-mono text-muted-foreground shrink-0 tabular-nums">
          {selectedEmpIds.length}–{filtered.length} / {employees.length}
        </span>
      </div>

      {/* Wireframe Structured Table View */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-2xs">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md border-b border-border text-[11px] font-semibold text-muted-foreground">
              <tr>
                <th className="p-2.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={onToggleAll}
                    className="p-1 rounded-md hover:bg-muted text-teal-600 dark:text-teal-400 cursor-pointer"
                    title={allSelected ? "Deselect All" : "Select All"}
                  >
                    {allSelected ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </button>
                </th>
                <th className="p-2.5">Employee</th>
                <th className="p-2.5">Working Hours</th>
                <th className="p-2.5">Start Date</th>
                <th className="p-2.5 text-right">Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {filtered.map((emp) => {
                const isChecked = selectedEmpIds.includes(emp.id);
                const mockWage = (emp as any).wage ?? (emp as any).monthlyWage ?? 4500.00;
                return (
                  <tr
                    key={emp.id}
                    onClick={() => onToggleEmp(emp.id)}
                    className={`cursor-pointer transition-colors apple-press ${
                      isChecked ? "bg-teal-500/10 text-foreground" : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <td className="p-2.5 text-center">
                      <div className="w-4 h-4 mx-auto text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4" strokeWidth={1.75} />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground/60" strokeWidth={1.5} />
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-foreground">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="p-2.5 text-muted-foreground">
                      40 hours/week
                    </td>
                    <td className="p-2.5 text-muted-foreground tabular-nums">
                      {(emp as any).joiningDate || "Jan 1"}
                    </td>
                    <td className="p-2.5 text-right font-bold text-foreground tabular-nums">
                      ₹ {Number(mockWage).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-3 flex justify-start items-center gap-3 border-t border-border">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || selectedEmpIds.length === 0}
          className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-900/20 disabled:opacity-50 transition-all apple-press cursor-pointer"
        >
          {submitting ? "Creating..." : "Create payrun"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted rounded-xl transition-colors apple-press cursor-pointer border border-border"
        >
          Back
        </button>
      </div>

      {/* Participant Note */}
      <p className="text-[11px] text-muted-foreground/80 italic pt-1">
        Participant note: user selects one or more eligible employees, then clicks Create Payrun. The created Payrun should contain only the selected employees.
      </p>
    </div>
  );
}
