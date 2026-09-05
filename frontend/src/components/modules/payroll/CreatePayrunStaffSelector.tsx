"use client";

import React from "react";
import { CheckSquare, Square, ArrowLeft } from "lucide-react";
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
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onToggleAll}
          className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
        >
          {selectedEmpIds.length === employees.length ? "Deselect All" : "Select All Active Staff"}
        </button>
        <span className="text-xs text-stone-400 font-medium">
          {selectedEmpIds.length} of {employees.length} chosen
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl p-1">
        {employees.map((emp) => {
          const isChecked = selectedEmpIds.includes(emp.id);
          return (
            <div
              key={emp.id}
              onClick={() => onToggleEmp(emp.id)}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 text-teal-700">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Square className="w-4 h-4 text-stone-300" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {emp.employeeCode} • {emp.department} • {emp.jobPosition}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Eligible Contract
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Back to Scope</span>
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || selectedEmpIds.length === 0}
          className="px-4 py-2 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Initializing..." : `Create Payrun (${selectedEmpIds.length} Staff)`}
        </button>
      </div>
    </div>
  );
}
