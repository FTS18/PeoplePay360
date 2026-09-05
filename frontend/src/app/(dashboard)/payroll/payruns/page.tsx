"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, RefreshCw, CreditCard, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { payrollService } from "@/services/payrollService";
import { Payrun, SalaryStructure, PayrunStatus } from "@/types";
import { CreatePayrunModal } from "@/components/modules/payroll/CreatePayrunModal";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";

export default function PayrunsPage() {
  const [payruns, setPayruns] = useState<Payrun[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [runsRes, structsRes] = await Promise.all([
        payrollService.getPayruns(),
        payrollService.getStructures(),
      ]);
      setPayruns(runsRes.content || []);
      setStructures(structsRes || []);
    } catch (err) {
      console.error("Failed to load payruns", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val?: number) => {
    const num = val != null ? Number(val) : 0;
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: PayrunStatus) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "COMPUTED":
      case "VALIDATED":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  return (
    <div className="space-y-6">
      <PayrollSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Payroll Payruns</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Two-step batch computation engine, statutory deductions, and PostgreSQL immutability settlements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Initialize Payrun
          </button>
        </div>
      </div>

      {/* Payruns List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/75 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Payrun Name</th>
                <th className="py-3.5 px-4">Period Window</th>
                <th className="py-3.5 px-4 text-center">Headcount</th>
                <th className="py-3.5 px-4 text-right">Gross Total</th>
                <th className="py-3.5 px-4 text-right">Net Disbursed</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {payruns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No payrun batches created yet. Click Initialize Payrun above to start.
                  </td>
                </tr>
              ) : (
                payruns.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{p.name}</div>
                      <div className="text-xs text-stone-400">{p.salaryStructureName || "Standard Rule Structure"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 text-xs font-medium">
                      {p.periodStart} to {p.periodEnd}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-stone-800">
                      {p.payslipsCount || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-700">
                      {formatCurrency(p.totalBasic != null ? Number(p.totalBasic) + Number(p.totalAllowances || 0) : 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-teal-950">
                      {formatCurrency(p.totalNet)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/payroll/payruns/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        Manage <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePayrunModal
        isOpen={modalOpen}
        structures={structures}
        onClose={() => setModalOpen(false)}
        onSuccess={(created) => setPayruns([created, ...payruns])}
      />
    </div>
  );
}
