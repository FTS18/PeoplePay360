"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, ArrowRight } from "lucide-react";
import { SalaryStructure, Payrun, Employee } from "@/types";
import { payrollService } from "@/services/payrollService";
import { apiClient } from "@/services/apiClient";
import { CreatePayrunStaffSelector } from "@/components/modules/payroll/CreatePayrunStaffSelector";

interface CreatePayrunModalProps {
  isOpen: boolean;
  structures: SalaryStructure[];
  onClose: () => void;
  onSuccess: (payrun: Payrun) => void;
}

export function CreatePayrunModal({ isOpen, structures, onClose, onSuccess }: CreatePayrunModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState<string>("Payrun OCTOBER 2026");
  const [structureId, setStructureId] = useState<string>(structures[0]?.id || "");
  const [periodStart, setPeriodStart] = useState<string>("2026-10-01");
  const [periodEnd, setPeriodEnd] = useState<string>("2026-10-31");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      apiClient
        .get<Employee[]>("/employees")
        .then((emps) => {
          const active = (emps || []).filter((e) => e.status === "ACTIVE");
          setEmployees(active);
          setSelectedEmpIds(active.map((e) => e.id));
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    setSelectedEmpIds(
      selectedEmpIds.length === employees.length ? [] : employees.map((e) => e.id)
    );
  };

  const toggleEmp = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinalSubmit = async () => {
    if (selectedEmpIds.length === 0) {
      setError("Please select at least one employee for the payrun batch.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const created = await payrollService.createDraft({
        name,
        salaryStructureId: structureId || structures[0]?.id,
        periodStart,
        periodEnd,
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to initialize payrun draft");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                {step === 1 ? "Step 1: Define Payrun Scope" : "Step 2: Select Eligible Staff"}
              </h3>
              <p className="text-[11px] text-stone-500">
                {step === 1 ? "Configure period window and structure" : `${selectedEmpIds.length} of ${employees.length} staff selected`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Payrun Batch Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Salary Structure</label>
              <select
                value={structureId}
                onChange={(e) => setStructureId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Period Start</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Period End</label>
                <input
                  type="date"
                  value={periodEnd}
                  min={periodStart}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer">
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs cursor-pointer"
              >
                <span>Continue to Staff Selection</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </form>
        ) : (
          <CreatePayrunStaffSelector
            employees={employees}
            selectedEmpIds={selectedEmpIds}
            submitting={submitting}
            onToggleEmp={toggleEmp}
            onToggleAll={toggleSelectAll}
            onBack={() => setStep(1)}
            onSubmit={handleFinalSubmit}
          />
        )}
      </div>
    </div>
  );
}
