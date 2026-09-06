"use client";

import React, { useState, useEffect } from "react";
import { Users, FileText, CalendarDays, IndianRupee, Calendar, Building2, UserCheck, Briefcase } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PunchClockWidget } from "@/components/dashboard/PunchClockWidget";
import { RecentPayrunTable } from "@/components/dashboard/RecentPayrunTable";
import { QuickAttendanceFeed } from "@/components/dashboard/QuickAttendanceFeed";
import { DepartmentCostWidget } from "@/components/dashboard/DepartmentCostWidget";
import { PayrollTrendWidget } from "@/components/dashboard/PayrollTrendWidget";
import { PayslipStatusWidget } from "@/components/dashboard/PayslipStatusWidget";
import { PayrollWarningsWidget, PayrollWarning } from "@/components/dashboard/PayrollWarningsWidget";
import { TimeOffOverviewWidget } from "@/components/dashboard/TimeOffOverviewWidget";
import { AttendanceOverviewWidget } from "@/components/dashboard/AttendanceOverviewWidget";
import { WorkforceCapacityWidget } from "@/components/dashboard/WorkforceCapacityWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { apiClient } from "@/services/apiClient";
import { payrollService } from "@/services/payrollService";
import { attendanceService } from "@/services/attendanceService";
import { useAuth } from "@/context/AuthContext";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

export interface PeriodOption {
  id: string;
  label: string;
  sinceDate: string;
  untilDate: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { id: "PAST_1_YEAR", label: "Past 1 Year", sinceDate: "2025-09-01", untilDate: "2026-09-30" },
  { id: "PAST_6_MONTHS", label: "Past 6 Months", sinceDate: "2026-03-01", untilDate: "2026-09-30" },
  { id: "2026-09", label: "Sep 2026", sinceDate: "2026-09-01", untilDate: "2026-09-30" },
  { id: "2026-08", label: "Aug 2026", sinceDate: "2026-08-01", untilDate: "2026-08-31" },
  { id: "2026-07", label: "Jul 2026", sinceDate: "2026-07-01", untilDate: "2026-07-31" },
  { id: "2026-06", label: "Jun 2026", sinceDate: "2026-06-01", untilDate: "2026-06-30" },
  { id: "2026-05", label: "May 2026", sinceDate: "2026-05-01", untilDate: "2026-05-31" },
  { id: "2026-04", label: "Apr 2026", sinceDate: "2026-04-01", untilDate: "2026-04-30" },
  { id: "2026-03", label: "Mar 2026", sinceDate: "2026-03-01", untilDate: "2026-03-31" },
];

export default function DashboardPage() {
  const { user, role } = useAuth();
  const { autoStartTour } = useOnboardingTour();

  useEffect(() => {
    autoStartTour();
  }, [autoStartTour]);

  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>("PAST_1_YEAR");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("OXP Pvt Ltd");

  const [departments, setDepartments] = useState<string[]>([]);

  const [metrics, setMetrics] = useState({
    totalNetSalaryPaid: "₹ 0.0L",
    payslipsGenerated: 0,
    paidPayslipsCount: 0,
    pendingPayslipsCount: 0,
    avgSalaryPerEmployee: "₹ 0",
    approvedTimeOffDays: "0 Days",
    attendanceHealthRatio: "0%",
    pendingLeaves: 0,
    refusedLeaves: 0,
    todayPresentCount: 0,
    todayLateCount: 0,
    todayAbsentCount: 0,
    todayOvertimeCount: 0,
    todayMissingCheckInsCount: 0,
    manualAttendanceEditsCount: 0,
  });

  const [payslipCounts, setPayslipCounts] = useState({
    draft: 0,
    computed: 0,
    validated: 0,
    paid: 0,
  });

  const [payrollWarnings, setPayrollWarnings] = useState<PayrollWarning[]>([]);

  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [recentPayruns, setRecentPayruns] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);

  const currentPeriod = PERIOD_OPTIONS.find((p) => p.id === selectedPeriodKey) || PERIOD_OPTIONS[0];

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
      const isEmployee = role === "EMPLOYEE";
      try {
        const deptQuery = selectedDepartment ? `&department=${encodeURIComponent(selectedDepartment)}` : "";
        const empTypeQuery = selectedEmployeeType && selectedEmployeeType !== "ALL" ? `&employeeType=${encodeURIComponent(selectedEmployeeType)}` : "";
        const periodQuery = `sinceDate=${currentPeriod.sinceDate}&untilDate=${currentPeriod.untilDate}`;

        const [summaryRes, payrunsRes, attendanceRes, payslipsRes] = await Promise.all([
          apiClient.get<any>(`/dashboard/summary?${periodQuery}${deptQuery}${empTypeQuery}`).catch(() => null),
          !isEmployee ? payrollService.getPayruns(0, 3).catch(() => null) : Promise.resolve(null),
          attendanceService.getAll(0, 5, isEmployee ? user?.id : undefined).catch(() => null),
          isEmployee && user?.id ? payrollService.getPayslips(undefined, 0, 3, user.id).catch(() => null) : Promise.resolve(null),
        ]);

        if (summaryRes) {
          const totalPaidNum = Number(summaryRes.totalNetSalaryPaid ?? summaryRes.totalPaid ?? 0);
          const formattedTotal = totalPaidNum >= 10000000
            ? `₹ ${(totalPaidNum / 10000000).toFixed(2)}Cr`
            : totalPaidNum >= 100000
            ? `₹ ${(totalPaidNum / 100000).toFixed(1)}L`
            : `₹ ${totalPaidNum.toLocaleString("en-IN")}`;

          const generated = Number(summaryRes.payslipsGenerated ?? 0);
          const paidCount = Number(summaryRes.paidPayslipsCount ?? 0);
          const avgSalNum = summaryRes.averageSalary ? Math.round(Number(summaryRes.averageSalary)) : 0;

          const rawHealth = Number(summaryRes.attendanceHealthRatio ?? 0);
          const cappedHealth = Math.min(100.0, Math.max(0.0, rawHealth));

          setMetrics({
            totalNetSalaryPaid: formattedTotal,
            payslipsGenerated: generated,
            paidPayslipsCount: paidCount,
            pendingPayslipsCount: Math.max(0, generated - paidCount),
            avgSalaryPerEmployee: avgSalNum > 0 ? `₹ ${avgSalNum.toLocaleString("en-IN")}` : "₹ 0",
            approvedTimeOffDays: summaryRes.approvedTimeOffDays ? `${summaryRes.approvedTimeOffDays} Days` : "0 Days",
            attendanceHealthRatio: `${cappedHealth.toFixed(1)}%`,
            pendingLeaves: Number(summaryRes.pendingLeaveRequestsCount ?? 0),
            refusedLeaves: Number(summaryRes.refusedLeaveRequestsCount ?? 0),
            todayPresentCount: Number(summaryRes.todayPresentCount ?? 0),
            todayLateCount: Number(summaryRes.todayLateCount ?? 0),
            todayAbsentCount: Number(summaryRes.todayAbsentCount ?? 0),
            todayOvertimeCount: Number(summaryRes.todayOvertimeCount ?? 0),
            todayMissingCheckInsCount: Number(summaryRes.todayMissingCheckInsCount ?? 0),
            manualAttendanceEditsCount: Number(summaryRes.manualAttendanceEditsCount ?? 0),
          });

          setPayslipCounts({
            draft: Number(summaryRes.draftPayslipsCount ?? 0),
            computed: Number(summaryRes.computedPayslipsCount ?? 0),
            validated: Number(summaryRes.validatedPayslipsCount ?? 0),
            paid: paidCount,
          });

          if (Array.isArray(summaryRes.payrollWarnings)) {
            setPayrollWarnings(summaryRes.payrollWarnings);
          }
        }

        if (payrunsRes?.content) {
          setRecentPayruns(
            payrunsRes.content.map((p: any) => ({
              id: p.id,
              reference: p.name,
              period: `${p.periodStart} – ${p.periodEnd}`,
              employees: p.payslipsCount ?? 0,
              totalDisbursed: `₹${Number(p.totalNet ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              status: p.status,
            }))
          );
        } else if (isEmployee && payslipsRes?.content) {
          setRecentPayruns(
            payslipsRes.content.map((ps: any) => ({
              id: ps.id,
              reference: `Payslip #${ps.id.slice(0, 8)}`,
              period: ps.contractReference || "Monthly",
              employees: 1,
              totalDisbursed: `₹${Number(ps.netSalary ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              status: ps.status,
            }))
          );
        }

        if (attendanceRes?.content) {
          setTodayAttendance(
            attendanceRes.content.map((a: any) => ({
              id: a.id,
              employeeCode: a.employeeCode || `EMP-${(a.id || "").slice(0, 4).toUpperCase()}`,
              name: a.employeeName || "Employee",
              checkIn: a.checkIn ?? "—",
              checkOut: a.checkOut ?? "—",
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
  }, [currentPeriod.sinceDate, currentPeriod.untilDate, selectedDepartment, selectedEmployeeType, role, user?.id]);

  const isEmployeeRole = role === "EMPLOYEE";

  if (isEmployeeRole) {
    return (
      <div className="space-y-6">
        {/* Employee Self-Service Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-brand">
              Employee Portal Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Welcome back, <strong>{user?.firstName} {user?.lastName}</strong>. View your personal payslips, leave balances, working schedule, and daily punch status.
            </p>
          </div>
        </div>

        {/* Employee Personal Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="My Latest Net Salary"
            value={recentPayruns.length > 0 ? recentPayruns[0].totalDisbursed : "₹ 0"}
            subtitle="Net pay from latest payslip"
            icon={IndianRupee}
            accent="teal"
            loading={loadingMetrics}
          />
          <MetricCard
            title="My Payslips"
            value={recentPayruns.length}
            subtitle="Total payslips issued"
            icon={FileText}
            accent="teal"
            loading={loadingMetrics}
          />
          <MetricCard
            title="Approved Time Off"
            value={metrics.approvedTimeOffDays}
            subtitle="Days approved this year"
            icon={CalendarDays}
            accent="gold"
            loading={loadingMetrics}
          />
          <MetricCard
            title="My Attendance Record"
            value={todayAttendance.length > 0 ? "100%" : "Present"}
            subtitle="Monthly attendance rating"
            icon={UserCheck}
            accent="teal"
            loading={loadingMetrics}
          />
        </div>

        {/* Employee Self-Service Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PunchClockWidget />
            <RecentPayrunTable payruns={recentPayruns} />
          </div>
          <div className="space-y-6">
            <TimeOffOverviewWidget
              pendingCount={metrics.pendingLeaves}
              approvedCount={parseInt(metrics.approvedTimeOffDays) || 0}
              refusedCount={metrics.refusedLeaves}
            />
            <QuickAttendanceFeed records={todayAttendance} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & 4 Filters matching Wireframe 6 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-brand">
            Payroll Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Executive oversight of payroll disbursements, workforce capacity, attendance trends, and leave settlement cycles.
          </p>
        </div>

        {/* 4 Filter Controls: Period, Department, Employee Type, Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:justify-end gap-2 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs w-full sm:w-auto">
            <span className="text-muted-foreground font-semibold shrink-0">Period:</span>
            <select
              value={selectedPeriodKey}
              onChange={(e) => setSelectedPeriodKey(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer flex-1 sm:flex-initial text-right sm:text-left"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-card text-foreground">{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs w-full sm:w-auto">
            <span className="text-muted-foreground font-semibold shrink-0">Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer flex-1 sm:flex-initial text-right sm:text-left"
            >
              <option value="" className="bg-card text-foreground">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-card text-foreground">{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs w-full sm:w-auto">
            <span className="text-muted-foreground font-semibold shrink-0">Employee Type:</span>
            <select
              value={selectedEmployeeType}
              onChange={(e) => setSelectedEmployeeType(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer flex-1 sm:flex-initial text-right sm:text-left"
            >
              <option value="ALL" className="bg-card text-foreground">All Types</option>
              <option value="FULL_TIME" className="bg-card text-foreground">Full Time</option>
              <option value="CONTRACT" className="bg-card text-foreground">Contractor</option>
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-xs w-full sm:w-auto">
            <span className="text-muted-foreground font-semibold shrink-0">Company:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer flex-1 sm:flex-initial text-right sm:text-left"
            >
              <option value="OXP Pvt Ltd" className="bg-card text-foreground">OXP Pvt Ltd</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards Grid matching Wireframe 6 */}
      <div id="dashboard-metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Net Salary Paid"
          value={metrics.totalNetSalaryPaid}
          subtitle="+8.2% vs previous month"
          icon={IndianRupee}
          accent="teal"
          loading={loadingMetrics}
        />
        <MetricCard
          title="Payslips Generated"
          value={metrics.payslipsGenerated}
          subtitle={`${metrics.paidPayslipsCount} paid, ${metrics.pendingPayslipsCount} pending`}
          icon={FileText}
          accent="teal"
          loading={loadingMetrics}
        />
        <MetricCard
          title="Avg Salary / Employee"
          value={metrics.avgSalaryPerEmployee}
          subtitle="Based on contract payroll"
          icon={Users}
          accent="teal"
          loading={loadingMetrics}
        />
        <MetricCard
          title="Approved Time Off Days"
          value={metrics.approvedTimeOffDays}
          subtitle="Across tabulated period"
          icon={CalendarDays}
          accent="gold"
          loading={loadingMetrics}
        />
        <MetricCard
          title="Attendance Health"
          value={metrics.attendanceHealthRatio}
          subtitle="Present / scheduled counts"
          icon={UserCheck}
          accent="teal"
          loading={loadingMetrics}
        />
      </div>

      {/* Middle Visual Analytics Row matching Wireframe 6 (3 Columns) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        <DepartmentCostWidget sinceDate={currentPeriod.sinceDate} selectedDepartment={selectedDepartment} />
        <PayrollTrendWidget sinceDate={currentPeriod.sinceDate} />
        <div className="space-y-4 flex flex-col justify-between h-full">
          <PayslipStatusWidget
            draftCount={payslipCounts.draft}
            computedCount={payslipCounts.computed}
            validatedCount={payslipCounts.validated}
            paidCount={payslipCounts.paid}
          />
          <PayrollWarningsWidget warnings={payrollWarnings} />
        </div>
      </div>

      {/* Bottom Operational Breakdown Row (3 Columns) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        <AttendanceOverviewWidget
          presentCount={metrics.todayPresentCount}
          lateCount={metrics.todayLateCount}
          absentCount={metrics.todayAbsentCount}
          overtimeCount={metrics.todayOvertimeCount}
          missingCheckInsCount={metrics.todayMissingCheckInsCount}
          manualEditsCount={metrics.manualAttendanceEditsCount}
          coverageRatio={metrics.attendanceHealthRatio}
        />
        <TimeOffOverviewWidget
          pendingCount={metrics.pendingLeaves}
          approvedCount={parseInt(metrics.approvedTimeOffDays) || 0}
          refusedCount={metrics.refusedLeaves}
        />
        <WorkforceCapacityWidget totalEmployees={260} />
      </div>

      {/* Operational Feeds & Punch Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <RecentPayrunTable payruns={recentPayruns} />
          <QuickAttendanceFeed records={todayAttendance} />
        </div>
        <div id="punch-clock-widget" className="space-y-6">
          <PunchClockWidget />
          <QuickActionsWidget pendingLeaves={metrics.pendingLeaves} />
        </div>
      </div>
    </div>
  );
}
