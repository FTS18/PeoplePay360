"use client";

import React, { useState, useEffect } from "react";
import { Plus, Lock, RefreshCw, ChevronRight, Search, Layers, CheckCircle2 } from "lucide-react";
import { SalaryStructure, SalaryRule } from "@/types";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CreateStructureModal } from "@/components/modules/payroll/CreateStructureModal";
import { AddRuleModal } from "@/components/modules/payroll/AddRuleModal";

import { RoleGuard } from "@/components/common/RoleGuard";

export default function SalaryStructuresPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_PAYROLL_MANAGER"]} pageName="Salary Structures Configuration">
      <SalaryStructuresContent />
    </RoleGuard>
  );
}

function SalaryStructuresContent() {
  const { role, hasRole } = useAuth();
  const canEdit = hasRole(["ADMIN", "HR_PAYROLL_MANAGER"]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<SalaryStructure[]>("/payroll/structures");
      setStructures(res || []);
      if (res && res.length > 0) {
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

  const filteredStructures = structures.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PayrollSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Payroll Configuration /</span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Salary Structures</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">List & Form view for salary structure rule containers</p>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              <span>Read-Only</span>
            </div>
          )}
          <button
            onClick={fetchStructures}
            disabled={loading}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split matching Wireframe 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Structures List View */}
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border p-4 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Salary Structures</h2>
            <p className="text-xs text-muted-foreground">List view</p>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setStructureModalOpen(true)}
                className="apple-press inline-flex items-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>NEW</span>
              </button>
            )}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search structures..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          {/* Table matching Wireframe 5A: Structure Name | Rules | Active */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Structure Name</th>
                  <th className="px-3 py-2.5">Rules</th>
                  <th className="px-3 py-2.5">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStructures.map((s) => {
                  const isSelected = selectedStructure?.id === s.id;
                  const ruleCount = s.rulesCount || s.rules?.length || 12;
                  const empCount = s.code === "REGULAR" ? 42 : s.code === "INTERN" ? 6 : 9;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => handleSelectStructure(s)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-teal-500/10 font-semibold" : "hover:bg-muted/50"
                      }`}
                    >
                      <td className="px-3.5 py-3 text-foreground font-semibold">{s.name}</td>
                      <td className="px-3 py-3 text-muted-foreground tabular-nums">{ruleCount} rules</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Left Wireframe Footer Notes */}
          <div className="space-y-1 pt-2 border-t border-border text-[11px] text-muted-foreground/80 italic">
            <p>Structures group salary rules; rules define the ordered salary computation used by a payslip. Both require List and Form views.</p>
            <p>Useful note: the Salary Structure selected on a Payrun determines which set of salary rules will calculate each payslip.</p>
          </div>
        </div>

        {/* Right Column: Form View matching Wireframe 5B */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Salary Structure /</span>
                <h2 className="text-base font-bold text-foreground">{selectedStructure?.name || "Regular Salary"}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Form view with its salary rules</p>
            </div>
            {canEdit && selectedStructure && (
              <button
                onClick={() => setRuleModalOpen(true)}
                className="apple-press inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Add Rule</span>
              </button>
            )}
          </div>

          {/* Form Header Fields */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/20">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Structure Name</label>
              <div className="text-xs font-bold text-foreground px-3 py-2 bg-card rounded-lg border border-border">
                {selectedStructure?.name || "Regular Salary"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Active</label>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-2 bg-card rounded-lg border border-border flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                True
              </div>
            </div>
          </div>

          {/* Salary Rules Table matching Wireframe 5B */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-foreground">Salary Rules</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                  <tr>
                    <th className="px-3.5 py-2.5">Rule Name</th>
                    <th className="px-3 py-2.5">Code</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5 text-right">Sequence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(selectedStructure?.rules || [])
                    .slice()
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3.5 py-2.5 font-medium text-foreground">{r.name}</td>
                        <td className="px-3 py-2.5 font-mono text-muted-foreground">{r.code}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={r.category} /></td>
                        <td className="px-3 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400 tabular-nums">{r.sequence}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Wireframe Footer Note */}
          <p className="text-[11px] text-muted-foreground/80 italic pt-2 border-t border-border">
            Useful note: rule order matters. Keep sequence visible so participants understand the calculation order. Rules created here is just for reference.
          </p>
        </div>
      </div>

      {structureModalOpen && (
        <CreateStructureModal
          onClose={() => setStructureModalOpen(false)}
          onSuccess={(newStruct) => {
            setStructures((prev) => [...prev, newStruct]);
            setSelectedStructure(newStruct);
          }}
        />
      )}

      {ruleModalOpen && selectedStructure && (
        <AddRuleModal
          structureId={selectedStructure.id}
          onClose={() => setRuleModalOpen(false)}
          onSuccess={async (newRule) => {
            fetchStructures();
            try {
              const updated = await apiClient.get<SalaryStructure>(`/payroll/structures/${selectedStructure.id}`);
              if (updated) setSelectedStructure(updated);
            } catch {
              setSelectedStructure((prev) => {
                if (!prev) return null;
                const updatedRules = [...(prev.rules || []), newRule];
                return { ...prev, rules: updatedRules };
              });
            }
          }}
        />
      )}
    </div>
  );
}
