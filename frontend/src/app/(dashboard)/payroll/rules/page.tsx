"use client";

import React, { useState, useEffect } from "react";
import { Plus, Lock, RefreshCw, ChevronRight, Search, Code, HelpCircle } from "lucide-react";
import { SalaryStructure, SalaryRule } from "@/types";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AddRuleModal } from "@/components/modules/payroll/AddRuleModal";
import { RuleDetailModal } from "@/components/modules/payroll/RuleDetailModal";

import { RoleGuard } from "@/components/common/RoleGuard";

export default function SalaryRulesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_PAYROLL_MANAGER"]} pageName="Salary Computation Rules">
      <SalaryRulesContent />
    </RoleGuard>
  );
}

function SalaryRulesContent() {
  const { role, hasRole } = useAuth();
  const canEdit = hasRole(["ADMIN", "HR_PAYROLL_MANAGER"]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string>("ALL");
  const [allRules, setAllRules] = useState<{ rule: SalaryRule; structureName: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  
  const [selectedRuleItem, setSelectedRuleItem] = useState<{ rule: SalaryRule; structureName: string } | null>(null);
  const [ruleModalOpen, setRuleModalOpen] = useState<boolean>(false);

  const fetchStructuresAndRules = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<SalaryStructure[]>("/payroll/structures");
      setStructures(res || []);

      const combined: { rule: SalaryRule; structureName: string }[] = [];
      if (Array.isArray(res)) {
        for (const s of res) {
          try {
            const detail = await apiClient.get<SalaryStructure>(`/payroll/structures/${s.id}`);
            if (detail?.rules) {
              detail.rules.forEach((r) => {
                combined.push({ rule: r, structureName: s.name });
              });
            }
          } catch {
            if (s.rules) {
              s.rules.forEach((r) => combined.push({ rule: r, structureName: s.name }));
            }
          }
        }
      }
      setAllRules(combined);
    } catch (err) {
      console.error("Failed to load salary rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructuresAndRules();
  }, []);

  const filteredRules = allRules.filter((item) => {
    if (selectedStructureId !== "ALL" && item.structureName !== selectedStructureId) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.rule.name.toLowerCase().includes(q) ||
        item.rule.code.toLowerCase().includes(q) ||
        item.rule.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PayrollSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Payroll Configuration /</span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Salary Rules</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">List view & computation methods</p>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              <span>Read-Only</span>
            </div>
          )}
          <button
            onClick={fetchStructuresAndRules}
            disabled={loading}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
            <span>Refresh</span>
          </button>
          {canEdit && (
            <button
              onClick={() => setRuleModalOpen(true)}
              className="apple-press inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>NEW</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: List View & Computation Note Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Rules Table matching Wireframe 6A */}
        <div className="lg:col-span-8 bg-card rounded-2xl border border-border p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Salary Rules</h2>
              <p className="text-xs text-muted-foreground">List view</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search salary rules..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
              </div>

              <select
                value={selectedStructureId}
                onChange={(e) => setSelectedStructureId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground font-semibold cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Structures</option>
                {structures.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table matching Wireframe 6A: Rule Name | Code | Category | Salary Structure | Sequence */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Rule Name</th>
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Salary Structure</th>
                  <th className="px-3 py-2.5 text-right">Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No rules found. Click NEW to add a salary rule.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map(({ rule, structureName }) => (
                    <tr
                      key={`${structureName}-${rule.id}`}
                      onClick={() => setSelectedRuleItem({ rule, structureName })}
                      className="hover:bg-teal-500/10 cursor-pointer transition-colors"
                    >
                      <td className="px-3.5 py-2.5 font-bold text-foreground">{rule.name}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{rule.code}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={rule.category} /></td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{structureName}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400 tabular-nums">{rule.sequence}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Left Footer Note */}
          <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-border">
            Useful note: List view should expose name, code, category, structure and sequence — the fields needed to understand a payroll rule quickly.
          </p>
        </div>

        {/* Right Column: Computation Note Box matching Wireframe 6 Bottom Right */}
        <div className="lg:col-span-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/10 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Computation Note</h3>
          </div>

          <div className="space-y-3 text-xs text-foreground/90">
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400">• Fixed Amount:</span> uses the exact value entered in the rule, e.g. Meal Allowance = 2,000.
            </div>
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400">• Percentage:</span> calculates the rule as a percentage of a selected base such as Contract Wage, Basic Salary, or Gross Salary, e.g. HRA = 20% × Basic Salary.
            </div>
            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400">• Formula Expression:</span> is used for advanced calculations where fixed or percentage methods are not sufficient, such as attendance-based salary, overtime, unpaid leave deductions, or calculations using multiple salary-rule values.
            </div>
          </div>
        </div>
      </div>

      {selectedRuleItem && (
        <RuleDetailModal
          rule={selectedRuleItem.rule}
          structureName={selectedRuleItem.structureName}
          onClose={() => setSelectedRuleItem(null)}
        />
      )}

      {ruleModalOpen && structures.length > 0 && (
        <AddRuleModal
          structureId={structures[0].id}
          onClose={() => setRuleModalOpen(false)}
          onSuccess={() => fetchStructuresAndRules()}
        />
      )}
    </div>
  );
}
