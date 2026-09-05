"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Clock, CalendarDays, Receipt, Edit2, ShieldAlert } from "lucide-react";
import { Employee } from "@/types";
import { SmartButtons, SmartButtonConfig } from "@/components/common/SmartButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee>({
    id: id || "e1",
    employeeCode: "EMP-001",
    firstName: "Michael",
    lastName: "Scott",
    workEmail: "michael.scott@dundermifflin.com",
    workPhone: "+1 (570) 555-0101",
    department: "Management",
    jobPosition: "Regional Manager",
    bankAccountNumber: "987654321012",
    bankIfscOrRouting: "ROUT-4091",
    taxIdOrPan: "PAN-SCOTT99",
    status: "ACTIVE",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [counts, setCounts] = useState({
    contracts: 0,
    attendance: 0,
    timeOff: 0,
    payslips: 0,
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [empRes, contractsRes, attendanceRes, timeoffRes, payslipsRes] = await Promise.allSettled([
          apiClient.get<Employee>(`/employees/${id}`),
          apiClient.get<any[]>(`/contracts/employee/${id}`),
          apiClient.get<any>(`/attendance?employeeId=${id}&size=1`),
          apiClient.get<any>(`/timeoff/requests?employeeId=${id}&size=1`),
          apiClient.get<any>(`/payroll/payslips?employeeId=${id}&size=1`),
        ]);

        if (empRes.status === "fulfilled" && empRes.value) {
          setEmployee(empRes.value);
        }

        setCounts({
          contracts: contractsRes.status === "fulfilled" && Array.isArray(contractsRes.value) ? contractsRes.value.length : 0,
          attendance: attendanceRes.status === "fulfilled" && attendanceRes.value?.totalElements != null ? attendanceRes.value.totalElements : 0,
          timeOff: timeoffRes.status === "fulfilled" && timeoffRes.value?.totalElements != null ? timeoffRes.value.totalElements : 0,
          payslips: payslipsRes.status === "fulfilled" && payslipsRes.value?.totalElements != null ? payslipsRes.value.totalElements : 0,
        });
      } catch {
        // Keeps fallback
      }
    }
    loadData();
  }, [id]);

  const smartButtons: SmartButtonConfig[] = [
    { label: "Contracts", value: counts.contracts, href: `${ROUTES.CONTRACTS.LIST}?employeeId=${employee.id}`, icon: FileText },
    { label: "Attendance", value: counts.attendance, href: `${ROUTES.ATTENDANCE}?employeeId=${employee.id}`, icon: Clock },
    { label: "Time Off", value: counts.timeOff, href: `${ROUTES.TIMEOFF.REQUESTS}?employeeId=${employee.id}`, icon: CalendarDays },
    { label: "Payslips", value: counts.payslips, href: `${ROUTES.PAYROLL.PAYSLIPS}?employeeId=${employee.id}`, icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(ROUTES.EMPLOYEES.LIST)}
            className="rounded-lg border border-(--border) p-2 hover:bg-(--accent)"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-(--foreground)">
                {employee.firstName} {employee.lastName}
              </h1>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-xs text-(--muted-foreground) font-medium">{employee.employeeCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-(--border) bg-(--card) px-3 py-1.5 text-xs font-medium hover:bg-(--accent)"
          >
            <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Smart Buttons Row */}
      <SmartButtons buttons={smartButtons} />

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work & Organization */}
        <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) border-b border-(--border) pb-2">
            Organizational Position
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-(--muted-foreground)">Job Position</span>
              <p className="font-semibold text-(--foreground) mt-0.5">{employee.jobPosition}</p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Department</span>
              <p className="font-semibold text-(--foreground) mt-0.5">{employee.department}</p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Work Email</span>
              <p className="font-medium text-(--foreground) mt-0.5">{employee.workEmail}</p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Work Phone</span>
              <p className="font-medium text-(--foreground) mt-0.5">{employee.workPhone || "-"}</p>
            </div>
          </div>
        </div>

        {/* Banking & Compliance */}
        <div className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) border-b border-(--border) pb-2">
            Banking & Legal Compliance
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-(--muted-foreground)">Bank Account</span>
              <p className="font-medium text-(--foreground) mt-0.5">{employee.bankAccountNumber || "Not configured"}</p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Routing / IFSC</span>
              <p className="font-medium text-(--foreground) mt-0.5">{employee.bankIfscOrRouting || "Not configured"}</p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Tax Identifier / PAN</span>
              <p className="font-medium text-(--foreground) mt-0.5">{employee.taxIdOrPan || "Not configured"}</p>
            </div>
            <div>
              <span className="text-(--muted-foreground)">Working Schedule</span>
              <p className="font-semibold text-(--foreground) mt-0.5">Standard 40h (Mon-Fri)</p>
            </div>
          </div>
        </div>
      </div>

      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={employee}
        onSaved={(updated) => setEmployee(updated)}
      />
    </div>
  );
}
