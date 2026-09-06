"use client";

import React, { useState, useEffect } from "react";
import { Building2, Users, Plus, RefreshCw, Layers, ShieldCheck } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";
import { Table, Column } from "@/components/common/Table";
import { Modal } from "@/components/common/Modal";
import { Edit2, Trash2 } from "lucide-react";
import { RoleGuard } from "@/components/common/RoleGuard";

interface DepartmentSummary {
  name: string;
  headcount: number;
  activeContracts: number;
  managerName?: string;
}

interface EmployeeOption {
  id: string;
  name: string;
  department: string;
  jobPosition: string;
}

export default function DepartmentsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="Departments Management">
      <DepartmentsContent />
    </RoleGuard>
  );
}

function DepartmentsContent() {
  const { hasRole } = useAuth();
  const canManage = hasRole(["ADMIN", "HR_MANAGER"]);

  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentSummary | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptLead, setDeptLead] = useState("");

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>("/employees?size=200");
      const emps: any[] = res?.content || (Array.isArray(res) ? res : []);

      const mappedEmps: EmployeeOption[] = emps.map((emp) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department || "General",
        jobPosition: emp.jobPosition || "Staff",
      }));
      setAllEmployees(mappedEmps);

      const deptMap: Record<string, { name: string; headcount: number; activeContracts: number; managerName?: string }> = {};

      emps.forEach((emp) => {
        const d = emp.department || "General";
        if (!deptMap[d]) {
          deptMap[d] = { name: d, headcount: 0, activeContracts: 0 };
        }
        deptMap[d].headcount += 1;
        if (emp.jobPosition?.toLowerCase().includes("head") || emp.jobPosition?.toLowerCase().includes("vp") || emp.jobPosition?.toLowerCase().includes("chief")) {
          deptMap[d].managerName = `${emp.firstName} ${emp.lastName}`;
        }
      });

      setDepartments(Object.values(deptMap));
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    const newDept: DepartmentSummary = {
      name: deptName.trim(),
      headcount: 0,
      activeContracts: 0,
      managerName: deptLead.trim() || undefined,
    };
    setDepartments((prev) => [...prev, newDept]);
    setDeptName("");
    setDeptLead("");
    setCreateModalOpen(false);
  };

  const handleEditDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !deptName.trim()) return;

    setDepartments((prev) =>
      prev.map((d) =>
        d.name === editingDept.name
          ? { ...d, name: deptName.trim(), managerName: deptLead.trim() || d.managerName }
          : d
      )
    );
    setEditModalOpen(false);
    setEditingDept(null);
  };

  const handleDeleteDepartment = (name: string) => {
    if (confirm(`Are you sure you want to remove the ${name} department?`)) {
      setDepartments((prev) => prev.filter((d) => d.name !== name));
    }
  };

  const columns: Column<DepartmentSummary>[] = [
    {
      header: "Department Name",
      width: "30%",
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Building2 className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div>
            <span className="font-bold text-foreground text-xs">{d.name}</span>
            <span className="block text-[10px] text-muted-foreground">Organizational Unit</span>
          </div>
        </div>
      ),
    },
    {
      header: "Department Lead",
      width: "25%",
      render: (d) => (
        <span className="text-xs font-medium text-foreground">
          {d.managerName || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Headcount",
      width: "20%",
      align: "center",
      render: (d) => (
        <span className="font-bold text-teal-600 dark:text-teal-400 text-xs tabular-nums">
          {d.headcount} Staff
        </span>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      header: "Actions",
      width: "25%",
      align: "center",
      render: (d) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setEditingDept(d);
              setDeptName(d.name);
              setDeptLead(d.managerName || "");
              setEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-muted apple-press cursor-pointer"
          >
            <Edit2 className="w-3 h-3 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleDeleteDepartment(d.name)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 apple-press cursor-pointer"
          >
            <Trash2 className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Subnav & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Employees /</span>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Departments</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage organizational divisions, department leadership, and workforce allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDepartments}
            disabled={loading}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          {canManage && (
            <button
              onClick={() => {
                setDeptName("");
                setDeptLead("");
                setCreateModalOpen(true);
              }}
              className="apple-press inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              New Department
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={departments}
        loading={loading}
        minWidth="min-w-[600px]"
        emptyMessage="No departments configured."
      />

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Department"
        subtitle="Define a new organizational division and assign department leadership."
        maxWidth="md"
      >
        <form onSubmit={handleCreateDepartment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Department Name *</label>
            <input
              type="text"
              placeholder="e.g. Research & Development"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Department Lead / Manager</label>
            <select
              value={deptLead}
              onChange={(e) => setDeptLead(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
            >
              <option value="">Unassigned (Select Lead)</option>
              {deptLead && !allEmployees.some((e) => e.name === deptLead) && (
                <option value={deptLead}>{deptLead}</option>
              )}
              {allEmployees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} — {emp.jobPosition} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted apple-press cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-xs apple-press cursor-pointer"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingDept(null);
        }}
        title="Edit Department"
        subtitle="Update department information and leadership assignment."
        maxWidth="md"
      >
        <form onSubmit={handleEditDepartment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Department Name *</label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Department Lead / Manager</label>
            <select
              value={deptLead}
              onChange={(e) => setDeptLead(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
            >
              <option value="">Unassigned (Select Lead)</option>
              {deptLead && !allEmployees.some((e) => e.name === deptLead) && (
                <option value={deptLead}>{deptLead}</option>
              )}
              {allEmployees
                .slice()
                .sort((a, b) => {
                  if (deptName) {
                    const aInDept = a.department.toLowerCase() === deptName.toLowerCase();
                    const bInDept = b.department.toLowerCase() === deptName.toLowerCase();
                    if (aInDept && !bInDept) return -1;
                    if (!aInDept && bInDept) return 1;
                  }
                  return a.name.localeCompare(b.name);
                })
                .map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} — {emp.jobPosition} ({emp.department})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                setEditingDept(null);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted apple-press cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-xs apple-press cursor-pointer"
            >
              Update Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
