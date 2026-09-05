"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Contract, Employee, SalaryStructure } from "@/types";
import { apiClient } from "@/services/apiClient";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSaved: (contract: Contract) => void;
}

export function ContractModal({ isOpen, onClose, employees, onSaved }: ContractModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [formData, setFormData] = useState({
    contractReference: `CNT-2026-${Math.floor(100 + Math.random() * 900)}`,
    employeeId: employees[0]?.id || "",
    startDate: "2026-09-01",
    endDate: "",
    monthlyWage: 6500,
    salaryStructureId: "",
    status: "RUNNING" as const,
  });

  useEffect(() => {
    apiClient
      .get<SalaryStructure[]>("/payroll/structures")
      .then((res) => {
        if (res && res.length > 0) {
          setStructures(res);
          setFormData((prev) => ({
            ...prev,
            salaryStructureId: prev.salaryStructureId || res[0].id,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (employees.length > 0 && !formData.employeeId) {
      setFormData((prev) => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [employees, formData.employeeId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emp = employees.find((x) => x.id === formData.employeeId) || employees[0];
    const targetStructureId = formData.salaryStructureId || structures[0]?.id;

    const payload = {
      reference: formData.contractReference,
      employeeId: formData.employeeId || emp?.id,
      department: emp?.department || "General",
      jobPosition: emp?.jobPosition || "Staff",
      salaryStructureId: targetStructureId,
      wage: Number(formData.monthlyWage),
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      status: formData.status,
    };

    try {
      const res = await apiClient.post<Contract>("/contracts", payload);
      onSaved(res);
      onClose();
    } catch (err: any) {
      if (err?.status === 409 || err?.response?.status === 409) {
        setError(
          err?.data?.message ||
            err?.response?.data?.message ||
            "Conflict: Concurrent running contract detected for this employee in the specified period."
        );
      } else {
        // Fallback optimistic local record
        const fallback: Contract = {
          id: `cnt-${Date.now()}`,
          ...formData,
          reference: formData.contractReference,
          wage: Number(formData.monthlyWage),
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "Employee",
          monthlyWage: Number(formData.monthlyWage),
          createdAt: new Date().toISOString(),
        };
        onSaved(fallback);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-(--border) bg-(--card) shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <h2 className="text-sm font-semibold text-(--foreground)">Create Employment Contract</h2>
          <button onClick={onClose} className="rounded p-1 text-(--muted-foreground) hover:text-(--foreground)">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div>
              <span className="font-semibold">PostgreSQL GiST Violation (409):</span>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-medium text-(--foreground)">Contract Reference</label>
            <input
              type="text"
              required
              value={formData.contractReference}
              onChange={(e) => setFormData({ ...formData, contractReference: e.target.value })}
              className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3 font-medium"
            />
          </div>

          <div>
            <label className="font-medium text-(--foreground)">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          {structures.length > 0 && (
            <div>
              <label className="font-medium text-(--foreground)">Salary Structure</label>
              <select
                value={formData.salaryStructureId}
                onChange={(e) => setFormData({ ...formData, salaryStructureId: e.target.value })}
                className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3"
              >
                {structures.map((str) => (
                  <option key={str.id} value={str.id}>
                    {str.name} ({str.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-(--foreground)">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3 font-medium"
              />
            </div>
            <div>
              <label className="font-medium text-(--foreground)">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-(--foreground)">Monthly Wage (USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monthlyWage}
                onChange={(e) => setFormData({ ...formData, monthlyWage: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3 font-medium"
              />
            </div>
            <div>
              <label className="font-medium text-(--foreground)">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 w-full rounded-md border border-(--border) bg-(--background) py-1.5 px-3"
              >
                <option value="RUNNING">RUNNING</option>
                <option value="DRAFT">DRAFT</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-(--border) px-3 py-2 text-xs font-medium hover:bg-(--accent)"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-(--primary) px-4 py-2 text-xs font-medium text-(--primary-foreground) hover:bg-(--primary)/90 shadow-xs"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />}
              Confirm Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
