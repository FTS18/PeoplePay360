"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Clock,
  CalendarDays,
  Edit2,
  Building,
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Landmark,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Employee } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/services/apiClient";
import { getDepartmentLead } from "@/utils/departmentLead";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee>({
    id: id || "e1",
    employeeCode: "EMP-001",
    firstName: "Aarav",
    lastName: "Mehta",
    email: "aarav@oxp.com",
    phone: "+91 98765 43210",
    department: "Finance",
    jobPosition: "Payroll Specialist",
    bankAccountNumber: "50100234567890",
    bankName: "HDFC Bank",
    bankIdentifierCode: "HDFC0000001",
    identificationNumber: "AAAPS1234A",
    status: "ACTIVE",
    workingScheduleName: "40 Hours / Week",
    managerName: "Sara Khan",
  });

  const [activeTab, setActiveTab] = useState<"work" | "private">("work");
  const [modalOpen, setModalOpen] = useState(false);
  const [counts, setCounts] = useState({
    contracts: 0,
    attendance: 0,
    timeOff: 0,
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [empRes, contractsRes, attendanceRes, timeoffRes] = await Promise.allSettled([
          apiClient.get<Employee>(`/employees/${id}`),
          apiClient.get<any[]>(`/contracts/employee/${id}`),
          apiClient.get<any>(`/attendance?employeeId=${id}&size=1`),
          apiClient.get<any>(`/timeoff/requests?employeeId=${id}&size=1`),
        ]);

        if (empRes.status === "fulfilled" && empRes.value) {
          setEmployee(empRes.value);
        }

        setCounts({
          contracts: contractsRes.status === "fulfilled" && Array.isArray(contractsRes.value) ? contractsRes.value.length : 1,
          attendance: attendanceRes.status === "fulfilled" && attendanceRes.value?.totalElements != null ? attendanceRes.value.totalElements : 19,
          timeOff: timeoffRes.status === "fulfilled" && timeoffRes.value?.totalElements != null ? timeoffRes.value.totalElements : 1,
        });
      } catch {
        // Retain default demo values if API call fails
      }
    }
    loadData();
  }, [id]);

  const initials = `${employee.firstName?.charAt(0) || ""}${employee.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(ROUTES.EMPLOYEES.LIST)}
            className="apple-press flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-2xs"
            aria-label="Back to employee directory"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Employee /</span>
              <h1 className="text-base font-bold text-foreground tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground">Main employee form with related HR actions</p>
          </div>
        </div>

        {/* Right Action & Smart Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setModalOpen(true)}
            className="apple-press inline-flex items-center gap-1.5 rounded-xl bg-teal-600 dark:bg-teal-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            EDIT
          </button>

          {/* Odoo Smart Buttons */}
          <Link
            href={`${ROUTES.TIMEOFF.REQUESTS}?employeeId=${employee.id}`}
            className="apple-press flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-teal-500/40 hover:bg-teal-500/5 transition-all shadow-2xs"
          >
            <CalendarDays className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
            <span>Time Off</span>
            <span className="rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {counts.timeOff}
            </span>
          </Link>

          <Link
            href={`${ROUTES.CONTRACTS.LIST}?employeeId=${employee.id}`}
            className="apple-press flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-teal-500/40 hover:bg-teal-500/5 transition-all shadow-2xs"
          >
            <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
            <span>Contracts</span>
            <span className="rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {counts.contracts}
            </span>
          </Link>

          <Link
            href={`${ROUTES.ATTENDANCE}?employeeId=${employee.id}`}
            className="apple-press flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-teal-500/40 hover:bg-teal-500/5 transition-all shadow-2xs"
          >
            <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
            <span>Attendance</span>
            <span className="rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {counts.attendance}
            </span>
          </Link>
        </div>
      </div>

      {/* Main Employee Form Sheet */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-apple-sm space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-start gap-4 pb-6 border-b border-border">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold text-xl border border-teal-500/25 shadow-inner">
            {initials || "EM"}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {employee.firstName} {employee.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="text-foreground font-semibold">{employee.jobPosition}</span>
              <span>•</span>
              <span>{employee.department}</span>
            </div>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 pt-0.5">
              <span>{employee.email}</span>
              <span>|</span>
              <span className="tabular-nums">{employee.phone || "+91 98765 43210"}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-4 border-b border-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab("work")}
            className={`pb-2.5 transition-all cursor-pointer ${
              activeTab === "work"
                ? "border-b-2 border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Work Information
          </button>
          <button
            onClick={() => setActiveTab("private")}
            className={`pb-2.5 transition-all cursor-pointer ${
              activeTab === "private"
                ? "border-b-2 border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Private Information
          </button>
        </div>

        {/* Tab 1: Work Information */}
        {activeTab === "work" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs animate-in fade-in duration-150">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Department</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                  {employee.department}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Department Lead & Assigned HR</label>
                <div className="p-3 rounded-xl border border-teal-500/25 bg-teal-500/5 dark:bg-teal-500/10 font-semibold text-foreground flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-teal-700 dark:text-teal-400">
                      {getDepartmentLead(employee.department, employee.managerName).name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-normal">
                      {getDepartmentLead(employee.department, employee.managerName).position}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Assigned HR Lead
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Working Schedule</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                  {employee.workingScheduleName || "40 Hours / Week"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Company</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                  OXP Pvt Ltd
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Job Position</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                  {employee.jobPosition}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Work Location</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                  Mumbai
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Status</label>
                <div className="p-2 rounded-xl border border-border bg-muted/30 flex items-center">
                  <StatusBadge status={employee.status} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Work Email</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground truncate">
                  {employee.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Private Information */}
        {activeTab === "private" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs animate-in fade-in duration-150">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Bank Account Number</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground tabular-nums">
                  {employee.bankAccountNumber || "Not configured"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Bank Name</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground">
                  {employee.bankName || "HDFC Bank"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">IFSC / Bank Routing Identifier</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground uppercase tabular-nums">
                  {employee.bankIdentifierCode || "HDFC0000001"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Permanent Account Number (PAN)</label>
                <div className="p-2.5 rounded-xl border border-border bg-muted/30 font-semibold text-foreground uppercase tabular-nums">
                  {employee.identificationNumber || "AAAPS1234A"}
                </div>
              </div>
            </div>
          </div>
        )}
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
