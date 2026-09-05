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
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { Role } from "@/types";
import { cn } from "@/utils/cn";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Employees", href: ROUTES.EMPLOYEES.LIST, icon: Users },
    { label: "Contracts", href: ROUTES.CONTRACTS.LIST, icon: FileText },
    { label: "Attendance", href: ROUTES.ATTENDANCE, icon: Clock },
    { label: "Time Off", href: ROUTES.TIMEOFF.REQUESTS, icon: CalendarDays },
    { label: "Payroll", href: ROUTES.PAYROLL.PAYRUNS, icon: CreditCard },
    { label: "Schedules", href: ROUTES.SCHEDULES, icon: CalendarCheck },
  ];

  const rolesList: { role: Role; label: string }[] = [
    { role: "ADMIN", label: "Admin" },
    { role: "HR_MANAGER", label: "HR Manager" },
    { role: "HR_PAYROLL_MANAGER", label: "HR Payroll Manager" },
    { role: "HR_PAYROLL_USER", label: "HR Payroll User" },
    { role: "EMPLOYEE", label: "Employee" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--border) bg-(--card)/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 font-semibold tracking-tight text-(--foreground)">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-(--primary) text-(--primary-foreground)">
              <CreditCard className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight">PeoplePay360</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-(--secondary) text-(--foreground)"
                      : "text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--secondary)/60"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Role Simulator & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for Hackathon Testing */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-(--border) bg-(--secondary)/50 text-[11px] font-medium text-(--foreground) hover:bg-(--secondary) transition-colors"
            >
              <ShieldCheck className="h-3 w-3 text-(--muted-foreground)" strokeWidth={1.5} />
              <span>Role: <strong className="font-semibold">{role.replace(/_/g, " ")}</strong></span>
              <ChevronDown className="h-3 w-3 text-(--muted-foreground)" strokeWidth={1.5} />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-md border border-(--border) bg-(--card) py-1 shadow-lg shadow-black/5 z-50">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-(--muted-foreground) font-semibold">
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
                      "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-(--secondary) transition-colors",
                      role === r.role ? "font-semibold text-(--foreground) bg-(--secondary)/50" : "text-(--muted-foreground)"
                    )}
                  >
                    <span>{r.label}</span>
                    {role === r.role && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Initials Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-(--border)">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-(--secondary) text-[11px] font-semibold text-(--foreground)">
                {user.firstName[0]}
                {user.lastName[0] || ""}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium leading-none text-(--foreground)">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-(--muted-foreground) leading-none mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
