"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: Role[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"] },
  { label: "Employees", href: ROUTES.EMPLOYEES.LIST, icon: Users, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
  { label: "Contracts", href: ROUTES.CONTRACTS.LIST, icon: FileText, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
  { label: "Attendance", href: ROUTES.ATTENDANCE, icon: Clock, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"] },
  { label: "Time Off", href: ROUTES.TIMEOFF.REQUESTS, icon: CalendarDays, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"] },
  { label: "Leave Allocations", href: ROUTES.TIMEOFF.ALLOCATIONS, icon: CalendarCheck, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
  { label: "Payroll", href: ROUTES.PAYROLL.PAYRUNS, icon: CreditCard, roles: ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"] },
  { label: "Schedules", href: ROUTES.SCHEDULES, icon: CalendarCheck, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleRoleChange = async (newRole: Role) => {
    await switchRole(newRole);
    setRoleMenuOpen(false);
    const isAllowed = ALL_NAV_ITEMS.some(
      (item) => item.roles.includes(newRole) && (pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href)))
    );
    if (!isAllowed) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  const rolesList: { role: Role; label: string }[] = [
    { role: "ADMIN", label: "Admin" },
    { role: "HR_MANAGER", label: "HR Manager" },
    { role: "HR_PAYROLL_MANAGER", label: "HR Payroll Manager" },
    { role: "HR_PAYROLL_USER", label: "HR Payroll User" },
    { role: "EMPLOYEE", label: "Employee" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Dark Vertical Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[oklch(18%_0.03_195)] border-r border-[oklch(24%_0.03_195)] transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand & Mobile Close */}
        <div>
          <div className="flex h-16 items-center justify-between px-6 border-b border-[oklch(24%_0.03_195)]">
            <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(28%_0.06_195)] text-[oklch(85%_0.14_195)]">
                <CreditCard className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-[oklch(95%_0.01_195)]">
                  PeoplePay360
                </span>
                <span className="block text-[10px] font-medium tracking-wide text-[oklch(70%_0.02_195)] uppercase">
                  HR & Payroll Ops
                </span>
              </div>
            </Link>
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                className="rounded p-1 text-[oklch(70%_0.02_195)] hover:text-[oklch(95%_0.01_195)] md:hidden"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[oklch(28%_0.06_195)] text-[oklch(85%_0.14_195)] font-semibold shadow-xs"
                      : "text-[oklch(70%_0.02_195)] hover:text-[oklch(95%_0.01_195)] hover:bg-[oklch(22%_0.03_195)]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Persona / Role Switcher */}
        <div className="p-3 border-t border-[oklch(24%_0.03_195)]">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[oklch(22%_0.03_195)] hover:bg-[oklch(25%_0.03_195)] text-left transition-colors border border-[oklch(26%_0.03_195)]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[oklch(28%_0.06_195)] text-xs font-bold text-[oklch(85%_0.14_195)]">
                  {user?.firstName?.[0] || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[oklch(95%_0.01_195)]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-[10px] text-[oklch(85%_0.14_195)] font-medium tracking-wide">
                    {role.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[oklch(70%_0.02_195)] shrink-0 ml-1" strokeWidth={1.5} />
            </button>

            {roleMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-[oklch(28%_0.03_195)] bg-[oklch(20%_0.03_195)] p-1.5 shadow-xl">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(70%_0.02_195)]">
                  Simulate Persona
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleChange(r.role)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      role === r.role
                        ? "bg-[oklch(28%_0.06_195)] text-[oklch(85%_0.14_195)] font-medium"
                        : "text-[oklch(70%_0.02_195)] hover:text-[oklch(95%_0.01_195)] hover:bg-[oklch(24%_0.03_195)]"
                    }`}
                  >
                    <span>{r.label}</span>
                    {role === r.role && <ShieldCheck className="h-3 w-3 text-[oklch(85%_0.14_195)]" strokeWidth={1.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
