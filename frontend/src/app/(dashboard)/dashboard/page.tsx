"use client";

import React, { useState, useEffect } from "react";
import { Users, FileText, CalendarDays, DollarSign, Filter, Calendar, Building2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PunchClockWidget } from "@/components/dashboard/PunchClockWidget";
import { RecentPayrunTable } from "@/components/dashboard/RecentPayrunTable";
import { QuickAttendanceFeed } from "@/components/dashboard/QuickAttendanceFeed";
import { DepartmentCostWidget } from "@/components/dashboard/DepartmentCostWidget";
import { PayrollTrendWidget } from "@/components/dashboard/PayrollTrendWidget";
import { apiClient } from "@/services/apiClient";
import { payrollService } from "@/services/payrollService";
import { attendanceService } from "@/services/attendanceService";

const PERIOD_OPTIONS = [
  { label: "Past 6 Months", months: 6 },
  { label: "Past 30 Days", months: 1 },
  { label: "Past 90 Days", months: 3 },
  { label: "Past 1 Year", months: 12 },
  { label: "All Time", months: 36 },
];

export default function DashboardPage() {
  const [selectedMonths, setSelectedMonths] = useState<number>(6);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [departments, setDepartments] = useState<string[]>([]);

  const [metrics, setMetrics] = useState({
    activeEmployees: 8,
    runningContracts: 8,
    pendingLeaves: 2,
    monthlyPayrollDisbursed: "$54,200.00",
  });

  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [recentPayruns, setRecentPayruns] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);

  const getSinceDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 10);
  };

  const sinceDate = getSinceDate(selectedMonths);

  useEffect(() => {
    apiClient
      .get<string[]>("/employees/departments")
      .then((depts) => {
        if (Array.isArray(depts)) setDepartments(depts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      setLoadingMetrics(true);
      try {
        const [summaryRes, payrunsRes, attendanceRes] = await Promise.all([
          apiClient.get<any>(`/dashboard/summary?sinceDate=${sinceDate}`).catch(() => null),
          payrollService.getPayruns(0, 3).catch(() => null),
          attendanceService.getAll(0, 5).catch(() => null),
        ]);

        if (summaryRes) {
          const totalPaidNum = summaryRes.totalNetSalaryPaid ?? summaryRes.totalPaid;
          const formattedTotal = totalPaidNum != null
            ? `$${Number(totalPaidNum).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "$0.00";

          setMetrics({
            activeEmployees: summaryRes.activeEmployeesCount ?? summaryRes.activeEmployees ?? 0,
            runningContracts: summaryRes.runningContractsCount ?? summaryRes.runningContracts ?? 0,
            pendingLeaves: summaryRes.pendingLeaveRequestsCount ?? summaryRes.pendingLeaves ?? 0,
            monthlyPayrollDisbursed: formattedTotal,
          });
        }

        if (payrunsRes?.content) {
          setRecentPayruns(
            payrunsRes.content.map((p: any) => ({
              id: p.id,
              reference: p.name,
              period: `${p.periodStart} – ${p.periodEnd}`,
              employees: p.payslipsCount ?? 0,
              totalDisbursed: `$${Number(p.totalNet ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              status: p.status,
            }))
          );
        }

        if (attendanceRes?.content) {
          setTodayAttendance(
            attendanceRes.content.map((a: any) => ({
              id: a.id,
              employeeCode: a.employeeCode,
              name: a.employeeName,
              checkIn: a.checkIn ?? "—",
              status: a.status,
            }))
          );
        }
      } catch {
        // graceful degradation
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadDashboard();
  }, [sinceDate]);

  return (
    <div className="space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[oklch(20%_0.02_240)]">
            Operational Payroll Dashboard
          </h1>
          <p className="text-xs text-[oklch(50%_0.02_240)]">
            Real-time workforce activity, active payruns, and financial allocations
          </p>
        </div>

        {/* Period & Department Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            <select
              value={selectedMonths}
              onChange={(e) => setSelectedMonths(Number(e.target.value))}
              className="bg-transparent text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.months} value={opt.months}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Employees"
          value={metrics.activeEmployees}
          subtitle="Full-time headcount"
          icon={Users}
          accent="teal"
          trend={{ value: "+1 this month", positive: true }}
          loading={loadingMetrics}
        />
        <MetricCard
          title="Running Contracts"
          value={metrics.runningContracts}
          subtitle="Non-overlapping active terms"
          icon={FileText}
          accent="charcoal"
          loading={loadingMetrics}
        />
        <MetricCard
          title="Pending Leaves"
          value={metrics.pendingLeaves}
          subtitle="Awaiting manager sign-off"
          icon={CalendarDays}
          accent="gold"
          trend={{ value: "2 urgent", positive: false }}
          loading={loadingMetrics}
        />
        <MetricCard
          title="Last Disbursed"
          value={metrics.monthlyPayrollDisbursed}
          subtitle="Validated & paid"
          icon={DollarSign}
          accent="green"
          loading={loadingMetrics}
        />
      </div>

      {/* Visual Analytics Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DepartmentCostWidget sinceDate={sinceDate} selectedDepartment={selectedDepartment} />
        <PayrollTrendWidget sinceDate={sinceDate} />
      </div>

      {/* Main Operational Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentPayrunTable payruns={recentPayruns} />
          <QuickAttendanceFeed records={todayAttendance} />
        </div>
        <div className="space-y-6">
          <PunchClockWidget />
        </div>
      </div>
    </div>
  );
}
