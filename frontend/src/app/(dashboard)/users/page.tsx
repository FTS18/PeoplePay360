"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Search, UserPlus, RefreshCw } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { Employee, EmployeeStatus, PageResponse, Role } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserAccessModal } from "@/components/users/UserAccessModal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RoleBadge } from "@/components/users/RoleBadge";

const ROLES: { value: Role | ""; label: string }[] = [
  { value: "", label: "All Roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "HR_MANAGER", label: "HR Manager" },
  { value: "HR_PAYROLL_MANAGER", label: "HR Payroll Manager" },
  { value: "HR_PAYROLL_USER", label: "HR Payroll User" },
  { value: "EMPLOYEE", label: "Employee" },
];

const PAGE_SIZE = 20;

import { RoleGuard } from "@/components/common/RoleGuard";

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]} pageName="Users & Access Management">
      <UsersContent />
    </RoleGuard>
  );
}

function UsersContent() {
  const { role: currentRole } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [loading, setLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Admin-only page guard
  useEffect(() => {
    if (currentRole !== "ADMIN") router.replace("/dashboard");
  }, [currentRole, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        sort: "firstName,asc",
      });
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter) params.set("role", roleFilter);

      const res = await apiClient.get<PageResponse<Employee>>(`/employees?${params}`);
      setEmployees(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch {
      // Keep stale data on error
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  const openCreate = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    fetchUsers();
  };

  if (currentRole !== "ADMIN") return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">User Management</h1>
            <p className="text-xs text-muted-foreground">
              {totalElements} user{totalElements !== 1 ? "s" : ""} · Admin panel
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-xs font-semibold text-white transition-all shadow-apple-sm cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as Role | ""); setPage(0); }}
          className="px-3 py-2 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all cursor-pointer"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Department</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Job Position</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading && employees.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center text-[10px] font-bold border border-teal-500/20">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{emp.firstName} {emp.lastName}</div>
                        <div className="text-[10px] text-muted-foreground">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{emp.department}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{emp.jobPosition}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={emp.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(emp)}
                      className="apple-press px-3 py-1 rounded-lg border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                    >
                      Manage Access
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              Page {page + 1} of {totalPages} · {totalElements} total
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pageNum = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      pageNum === page
                        ? "bg-teal-600 text-white border-teal-600"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <UserAccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        employee={selectedEmployee}
      />
    </div>
  );
}
