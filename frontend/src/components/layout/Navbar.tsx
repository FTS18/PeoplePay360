"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  CalendarDays,
  CreditCard,
  CalendarCheck,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { Role } from "@/types";
import { cn } from "@/utils/cn";
import { isParentNavActive, NavItemDef } from "@/utils/navigation";
import { getDepartmentLead } from "@/utils/departmentLead";
import { GlobalAttendanceWidget } from "./GlobalAttendanceWidget";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [employeesMenuOpen, setEmployeesMenuOpen] = useState(false);
  const [contractsMenuOpen, setContractsMenuOpen] = useState(false);
  const [timeoffMenuOpen, setTimeoffMenuOpen] = useState(false);
  const [payrollMenuOpen, setPayrollMenuOpen] = useState(false);

  const navItems: (NavItemDef & { hasDropdown?: boolean })[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Employees", href: ROUTES.EMPLOYEES.LIST, matchPrefixes: ["/employees"], icon: Users, hasDropdown: true },
    { label: "Contracts", href: ROUTES.CONTRACTS.LIST, matchPrefixes: ["/contracts"], icon: FileText, hasDropdown: true },
    { label: "Attendance", href: ROUTES.ATTENDANCE, matchPrefixes: ["/attendance"], icon: Clock },
    { label: "Time Off", href: ROUTES.TIMEOFF.REQUESTS, matchPrefixes: ["/timeoff"], icon: CalendarDays, hasDropdown: true },
    { label: "Payroll", href: ROUTES.PAYROLL.PAYRUNS, matchPrefixes: ["/payroll"], icon: CreditCard, hasDropdown: true },
    { label: "Schedules", href: ROUTES.SCHEDULES, matchPrefixes: ["/schedules"], icon: CalendarCheck },
  ];

  const rolesList: { role: Role; label: string }[] = [
    { role: "ADMIN", label: "Admin" },
    { role: "HR_MANAGER", label: "HR Manager" },
    { role: "HR_PAYROLL_MANAGER", label: "HR Payroll Manager" },
    { role: "HR_PAYROLL_USER", label: "HR Payroll User" },
    { role: "EMPLOYEE", label: "Employee" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 apple-glass">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-700 text-white shadow-2xs">
              <CreditCard className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">PeoplePay360</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isParentNavActive(item, pathname);

              if (item.label === "Employees") {
                return (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setEmployeesMenuOpen(!employeesMenuOpen)}
                      className={cn(
                        "apple-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer",
                        isActive
                          ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Employees</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    </button>

                    {employeesMenuOpen && (
                      <div className="absolute left-0 mt-2 w-44 rounded-2xl border border-border bg-card py-1.5 shadow-apple-modal z-50 animate-in fade-in">
                        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Menus under Employees
                        </div>
                        <Link
                          href={ROUTES.EMPLOYEES.LIST}
                          onClick={() => setEmployeesMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Employees
                        </Link>
                        <Link
                          href={ROUTES.CONTRACTS.LIST}
                          onClick={() => setEmployeesMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Contracts
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.label === "Contracts") {
                return (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setContractsMenuOpen(!contractsMenuOpen)}
                      className={cn(
                        "apple-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer",
                        isActive
                          ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Contracts</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    </button>

                    {contractsMenuOpen && (
                      <div className="absolute left-0 mt-2 w-44 rounded-2xl border border-border bg-card py-1.5 shadow-apple-modal z-50 animate-in fade-in">
                        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Menus under Contracts
                        </div>
                        <Link
                          href={ROUTES.CONTRACTS.LIST}
                          onClick={() => setContractsMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          All Contracts
                        </Link>
                        <Link
                          href={`${ROUTES.CONTRACTS.LIST}?status=RUNNING`}
                          onClick={() => setContractsMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Running Contracts
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.label === "Time Off") {
                return (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setTimeoffMenuOpen(!timeoffMenuOpen)}
                      className={cn(
                        "apple-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer",
                        isActive
                          ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Time Off</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    </button>

                    {timeoffMenuOpen && (
                      <div className="absolute left-0 mt-2 w-44 rounded-2xl border border-border bg-card py-1.5 shadow-apple-modal z-50 animate-in fade-in">
                        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Menus under Time Off
                        </div>
                        <Link
                          href={ROUTES.DASHBOARD}
                          onClick={() => setTimeoffMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href={ROUTES.TIMEOFF.REQUESTS}
                          onClick={() => setTimeoffMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Time Offs
                        </Link>
                        <Link
                          href="/timeoff/types"
                          onClick={() => setTimeoffMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Time Off Types
                        </Link>
                        <Link
                          href={ROUTES.TIMEOFF.ALLOCATIONS}
                          onClick={() => setTimeoffMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Allocations
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.label === "Payroll") {
                return (
                  <div key={item.href} className="relative">
                    <button
                      onClick={() => setPayrollMenuOpen(!payrollMenuOpen)}
                      className={cn(
                        "apple-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer",
                        isActive
                          ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Payroll</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                    </button>

                    {payrollMenuOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-border bg-card py-1.5 shadow-apple-modal z-50 animate-in fade-in">
                        <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Menus under Payroll
                        </div>
                        <Link
                          href={ROUTES.PAYROLL.PAYRUNS}
                          onClick={() => setPayrollMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Payruns
                        </Link>
                        <Link
                          href={ROUTES.PAYROLL.PAYSLIPS}
                          onClick={() => setPayrollMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Payslips
                        </Link>
                        <Link
                          href={ROUTES.PAYROLL.STRUCTURES}
                          onClick={() => setPayrollMenuOpen(false)}
                          className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Salary Structures & Rules
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href || item.label}
                  href={item.href || "#"}
                  className={cn(
                    "apple-press flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors",
                    isActive
                      ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Global Attendance Quick Action Widget, Role Simulator & User Profile */}
        <div className="flex items-center gap-3">
          {/* Global Attendance Quick Punch Widget */}
          <GlobalAttendanceWidget />

          {/* Quick Role Switcher for Testing */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-apple-sm cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
              <span>Role: <strong className="font-semibold">{role.replace(/_/g, " ")}</strong></span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-card py-1.5 shadow-apple-modal z-50 animate-in fade-in">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Simulate Role (RBAC)
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setRoleMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-muted transition-colors cursor-pointer",
                      role === r.role ? "font-semibold text-foreground bg-muted/60" : "text-muted-foreground"
                    )}
                  >
                    <span>{r.label}</span>
                    {role === r.role && <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Badge & Dropdown */}
          {user && (
            <div className="relative pl-2 border-l border-stone-200/70 dark:border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="apple-press flex items-center gap-2 text-left cursor-pointer focus:outline-none"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-400 text-xs font-bold border border-teal-500/20">
                  {user.firstName[0]}
                  {user.lastName[0] || ""}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold leading-none text-foreground flex items-center gap-1">
                    {user.firstName} {user.lastName}
                    <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    {user.email}
                  </p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card p-3.5 shadow-apple-modal z-50 animate-in fade-in space-y-3">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-bold shadow-xs">
                      {user.firstName[0]}{user.lastName[0] || ""}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Assigned Department Lead & HR */}
                  <div className="rounded-xl border border-teal-500/25 bg-teal-500/5 dark:bg-teal-500/10 p-2.5 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                      Dept Lead & Assigned HR
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {getDepartmentLead(user.role === "EMPLOYEE" ? "Engineering" : "Finance").name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {getDepartmentLead(user.role === "EMPLOYEE" ? "Engineering" : "Finance").position}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
