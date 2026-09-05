"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Users, Plus } from "lucide-react";
import { Employee } from "@/types";
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "grid" | "list">("kanban");
  const [modalOpen, setModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const pageParam = parseInt(searchParams?.get("page") || "0", 10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pageParam.toString(),
          size: "20",
        });
        if (search) queryParams.append("search", search);
        if (department) queryParams.append("department", department);

        const res = await apiClient.get<any>(`/employees?${queryParams.toString()}`);
        if (res && res.content) {
          setEmployees(res.content);
          setTotalPages(res.totalPages || 0);
        } else if (Array.isArray(res)) {
          setEmployees(res);
          setTotalPages(1);
        }
      } catch {
        // Retain existing state if any
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [pageParam, search, department]);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  );

  // Filtering is now handled on the backend via URL parameters in loadData.
  const filtered = employees;

  const columns: Column<Employee>[] = [
    {
      header: "Employee",
      accessor: "firstName",
      width: "28%",
      render: (emp) => (
        <Link href={ROUTES.EMPLOYEES.DETAIL(emp.id)} className="group block">
          <EmployeeCell name={`${emp.firstName} ${emp.lastName}`} subtext={emp.employeeCode} />
        </Link>
      ),
    },
    {
      header: "Work Email",
      accessor: "email",
      width: "24%",
      render: (emp) => (
        <span className="text-xs text-muted-foreground font-medium truncate block max-w-[200px]">
          {emp.email || "-"}
        </span>
      ),
    },
    { header: "Job Position", accessor: "jobPosition", width: "20%" },
    { header: "Department", accessor: "department", width: "16%" },
    {
      header: "Status",
      accessor: "status",
      width: "12%",
      align: "center",
      render: (emp) => <StatusBadge status={emp.status} />,
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
          pagination={{ currentPage: pageParam, totalPages }} 
        />
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

