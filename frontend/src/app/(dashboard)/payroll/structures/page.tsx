"use client";

import React, { useState, useEffect } from "react";
import { Layers, ShieldCheck, Plus, Lock, RefreshCw, ChevronRight } from "lucide-react";
import { SalaryStructure, SalaryRule } from "@/types";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";

export default function SalaryStructuresPage() {
  const { role, hasRole } = useAuth();
  const canEdit = hasRole(["ADMIN", "HR_PAYROLL_MANAGER"]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<SalaryStructure[]>("/payroll/structures");
      setStructures(res || []);
      if (res && res.length > 0) {
        // Load details with rules for the first structure
        const detail = await apiClient.get<SalaryStructure>(`/payroll/structures/${res[0].id}`);
        setSelectedStructure(detail || res[0]);
      }
    } catch (err) {
      console.error("Failed to load salary structures", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleSelectStructure = async (s: SalaryStructure) => {
    try {
      const detail = await apiClient.get<SalaryStructure>(`/payroll/structures/${s.id}`);
      setSelectedStructure(detail);
    } catch {
      setSelectedStructure(s);
    }
  };

  return (
    <div className="space-y-6">
      <PayrollSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Salary Structures & Rules</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configurable computation engine containers, rule sequencing, statutory deduction pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-700" strokeWidth={1.5} />
              <span>Read-Only Policy ({role.replace(/_/g, " ")})</span>
            </div>
          )}
          <button
            onClick={fetchStructures}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Structures List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Configured Structures</h2>
            <span className="text-xs text-stone-400">{structures.length} Containers</span>
          </div>

          <div className="space-y-2">
            {structures.map((s) => {
              const isSelected = selectedStructure?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectStructure(s)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-teal-50/50 border-teal-600/40 text-teal-900 shadow-xs"
                      : "bg-stone-50/50 border-stone-200/60 hover:bg-stone-50 text-stone-800"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs truncate">{s.name}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5 font-medium">
                      Code: {s.code} • {s.rulesCount || s.rules?.length || 0} Rules
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 ml-2" strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ordered Execution Sequence of Rules */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">
                Execution Pipeline: {selectedStructure?.name || "Select Structure"}
              </h2>
              <p className="text-xs text-stone-500">
                Rules execute sequentially (Seq 10 &rarr; 20 &rarr; 30) ensuring pro-rations and formulas resolve in strict dependency order.
              </p>
            </div>
            {canEdit ? (
              <button
                disabled
                title="Rules configured in database seed."
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700/10 text-teal-800 border border-teal-200/60 text-xs font-semibold rounded-xl opacity-75"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                Add Rule
              </button>
            ) : (
              <span className="text-[11px] text-stone-400 italic">Editing locked for role</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-100 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Seq</th>
                  <th className="py-2.5 px-3">Rule Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Computation Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(selectedStructure?.rules || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No rules linked to this salary structure.
                    </td>
                  </tr>
                ) : (
                  (selectedStructure?.rules || [])
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((r) => (
                      <tr key={r.id || r.code} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-semibold text-teal-800">{r.sequence}</td>
                        <td className="py-2.5 px-3 font-semibold text-stone-800">{r.name}</td>
                        <td className="py-2.5 px-3 text-stone-600 font-medium">{r.code}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              r.category === "DEDUCTION"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : r.category === "NET"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                                : "bg-teal-50 text-teal-700 border-teal-200"
                            }`}
                          >
                            {r.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {r.computationType === "PERCENTAGE" && `${r.percentage}% of ${r.percentageBaseCode || "BASIC"}`}
                          {r.computationType === "FIXED" && `$${r.fixedAmount || 0} (Fixed)`}
                          {r.computationType === "FORMULA" && (r.formula || "Dynamic Formula")}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
