"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { Employee } from "@/types";
import { EmployeeCard } from "@/components/employees/EmployeeCard";
import { EmployeeKanban } from "@/components/employees/EmployeeKanban";
import { EmployeeFilters } from "@/components/employees/EmployeeFilters";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { Table, Column } from "@/components/common/Table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "grid" | "list">("kanban");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const cached = apiClient.getFromCache<any>("/employees?size=100");
    const cachedList = Array.isArray(cached) ? cached : cached?.content;
    if (cachedList && cachedList.length > 0) {
      setEmployees(cachedList);
      setLoading(false);
    }

    async function loadData() {
      try {
        const res = await apiClient.get<any>("/employees?size=100");
        const list = Array.isArray(res) ? res : res?.content;
        if (list) setEmployees(list);
      } catch {
        // Retain existing state if any
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  );

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        (e.workEmail ? e.workEmail.toLowerCase().includes(q) : false);
      const matchDept = !department || e.department === department;
      return matchSearch && matchDept;
    });
  }, [employees, search, department]);

  const columns: Column<Employee>[] = [
    {
      header: "Code",
      accessor: "employeeCode",
      className: "text-xs font-semibold w-28",
      render: (emp) => (
        <Link href={ROUTES.EMPLOYEES.DETAIL(emp.id)} className="text-(--primary) hover:underline">
          {emp.employeeCode}
        </Link>
      ),
    },
    {
      header: "Employee Name",
      accessor: "firstName",
      render: (emp) => (
        <div>
          <div className="font-semibold text-(--foreground)">
            {emp.firstName} {emp.lastName}
          </div>
          <div className="text-[11px] text-(--muted-foreground)">{emp.workEmail}</div>
        </div>
      ),
    },
    { header: "Department", accessor: "department" },
    { header: "Job Position", accessor: "jobPosition" },
    {
      header: "Status",
      accessor: "status",
      align: "center",
      render: (emp) => <StatusBadge status={emp.status} />,
    },
    {
      header: "Actions",
      accessor: "id",
      align: "right",
      render: (emp) => (
        <Link
          href={ROUTES.EMPLOYEES.DETAIL(emp.id)}
          className="inline-flex items-center text-xs text-(--primary) hover:underline"
        >
          View <ChevronRight className="h-3 w-3 ml-0.5" strokeWidth={1.5} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-(--foreground)">Employee Directory</h1>
        <p className="text-xs text-(--muted-foreground)">
          Manage workforce identities, profiles, contract states, and departmental assignments
        </p>
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
              className="h-44 rounded-xl border border-(--border) bg-(--card)/50 p-5 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-(--muted)" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-24 rounded bg-(--muted)" />
                  <div className="h-2.5 w-32 rounded bg-(--muted)" />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-2.5 w-full rounded bg-(--muted)" />
                <div className="h-2.5 w-3/4 rounded bg-(--muted)" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--border) p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--muted) text-(--muted-foreground) mb-3">
            <Users className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-(--foreground)">No employees found</h3>
          <p className="text-xs text-(--muted-foreground) mt-1 max-w-sm">
            {search || department
              ? "No employees match your current filter criteria. Try clearing search or selecting all departments."
              : "No employees exist yet in the database. Add your first employee to get started."}
          </p>
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
        <Table columns={columns} data={filtered} />
      )}

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(newEmp) => setEmployees((prev) => [newEmp, ...prev])}
      />
    </div>
  );
}
