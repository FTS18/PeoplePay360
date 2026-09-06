"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Users, Plus, Trash2 } from "lucide-react";
import { Employee } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { canManageUser } from "@/utils/departmentLead";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeKanban } from "@/components/employees/EmployeeKanban";
import { EmployeeFilters } from "@/components/employees/EmployeeFilters";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";

function EmployeesContent() {
  const { role: currentUserRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "grid" | "list">("kanban");
  const [modalOpen, setModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams?.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState<number>(100);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          size: pageSize.toString(),
        });
        if (search) queryParams.append("search", search);
        if (department) queryParams.append("department", department);

        const res = await apiClient.get<any>(`/employees?${queryParams.toString()}`);
        if (res && res.content) {
          setEmployees(res.content);
          setTotalPages(res.totalPages || 1);
          setTotalElements(res.totalElements || res.content.length);
        } else if (Array.isArray(res)) {
          setEmployees(res);
          setTotalPages(1);
          setTotalElements(res.length);
        }
      } catch {
        // Retain existing state if any
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentPage, pageSize, search, department]);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  );

  // Filtering is now handled on the backend via URL parameters in loadData.
  const filtered = employees;

  const handleToggleEmployeeStatus = async (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    if (!canManageUser(currentUserRole, emp.role)) {
      return;
    }
    const nextStatus = emp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await apiClient.patch(`/employees/${emp.id}/toggle-status`);
      setEmployees((prev) => prev.map((x) => (x.id === emp.id ? { ...x, status: nextStatus } : x)));
    } catch {
      console.error("Failed to toggle employee status");
    }
  };

  const handleDeleteEmployee = async (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation();
    if (!canManageUser(currentUserRole, emp.role)) {
      return;
    }
    if (!window.confirm(`Are you sure you want to delete employee '${emp.firstName} ${emp.lastName}'?`)) {
      return;
    }
    try {
      await apiClient.delete(`/employees/${emp.id}`);
      setEmployees((prev) => prev.filter((x) => x.id !== emp.id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete employee");
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: "Employee",
      accessor: "firstName",
      width: "25%",
      render: (emp) => (
        <Link href={ROUTES.EMPLOYEES.DETAIL(emp.id)} className="group block">
          <EmployeeCell name={`${emp.firstName} ${emp.lastName}`} subtext={emp.employeeCode} />
        </Link>
      ),
    },
    {
      header: "Work Email",
      accessor: "email",
      width: "22%",
      render: (emp) => (
        <span className="text-xs text-muted-foreground font-medium truncate block max-w-[200px]">
          {emp.email || "-"}
        </span>
      ),
    },
    { header: "Job Position", accessor: "jobPosition", width: "18%" },
    { header: "Department", accessor: "department", width: "15%" },
    {
      header: "Status",
      accessor: "status",
      width: "12%",
      align: "center",
      render: (emp) => {
        const isEditable = canManageUser(currentUserRole, emp.role);
        return (
          <StatusBadge
            status={emp.status}
            onClick={isEditable ? (e) => handleToggleEmployeeStatus(e, emp) : undefined}
            title={isEditable ? "Click to toggle status" : "Cannot modify users of equal or higher role level"}
          />
        );
      },
    },
    {
      header: "Actions",
      accessor: "id",
      width: "8%",
      align: "center",
      render: (emp) => {
        const canDelete = canManageUser(currentUserRole, emp.role);
        if (!canDelete) return <span className="text-[10px] text-muted-foreground italic">Protected</span>;
        return (
          <button
            type="button"
            onClick={(e) => handleDeleteEmployee(e, emp)}
            title="Delete Employee"
            className="apple-press p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-xs text-muted-foreground">
            {viewMode === "kanban" ? "Default view: Kanban" : "List view for sort, filter and bulk scanning"}
          </p>
        </div>
      </div>

      <EmployeeFilters
        searchQuery={search}
        onSearchChange={setSearch}
        departmentFilter={department}
        onDepartmentChange={setDepartment}
        departments={departments}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddEmployee={() => setModalOpen(true)}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-card/60 p-5 shadow-apple-sm animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-stone-200 dark:bg-stone-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-24 rounded-full bg-stone-200 dark:bg-stone-800" />
                  <div className="h-2.5 w-32 rounded-full bg-stone-200 dark:bg-stone-800" />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-2.5 w-full rounded-full bg-stone-200 dark:bg-stone-800" />
                <div className="h-2.5 w-3/4 rounded-full bg-stone-200 dark:bg-stone-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-card p-12 text-center shadow-apple-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] dark:bg-stone-800 border border-[var(--border)] dark:border-stone-700/80 text-muted-foreground mb-3.5 shadow-2xs">
            <Users className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No employees found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {search || department
              ? "No employees match your current filter criteria. Try clearing search or selecting all departments."
              : "No employees exist yet in the database. Add your first employee to get started."}
          </p>
          {!search && !department && (
            <button
              onClick={() => setModalOpen(true)}
              className="apple-press mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-apple-sm transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              Add First Employee
            </button>
          )}
        </div>
      ) : viewMode === "kanban" ? (
        <EmployeeKanban employees={filtered} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filtered} 
          pagination={{ currentPage: currentPage, totalPages }} 
        />
      )}

      {/* Interactive Pagination Bar */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground tabular-nums">{employees.length > 0 ? currentPage * pageSize + 1 : 0}</strong>–
              <strong className="text-foreground tabular-nums">{Math.min((currentPage + 1) * pageSize, totalElements)}</strong> of{" "}
              <strong className="text-foreground tabular-nums">{totalElements}</strong> employees
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <div className="flex items-center gap-1.5">
              <span>Page Size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500 (All)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="apple-press inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Previous
            </button>
            <span className="px-2 font-semibold text-foreground tabular-nums">
              Page {currentPage + 1} of {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="apple-press inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(newEmp) => setEmployees((prev) => [newEmp, ...prev])}
      />
    </div>
  );
}

import { RoleGuard } from "@/components/common/RoleGuard";

export default function EmployeesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]} pageName="the Employees Directory">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
            <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
          </div>
        }
      >
        <EmployeesContent />
      </Suspense>
    </RoleGuard>
  );
}

