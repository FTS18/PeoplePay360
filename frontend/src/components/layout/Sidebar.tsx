"use client";

import React, { useState, useEffect } from "react";
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
  ChevronRight,
  ShieldCheck,
  LogOut,
  X,
  Sliders,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/config/routes";
import { Role } from "@/types";

import { getActiveSubItem, isParentNavActive, NavItemDef, SubNavItem } from "@/utils/navigation";

interface SubItem extends SubNavItem {
  roles: Role[];
}

interface NavItem extends NavItemDef {
  icon: any;
  roles: Role[];
  subItems?: SubItem[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"],
  },
  {
    label: "Employees",
    icon: Users,
    roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"],
    subItems: [
      { label: "Employees", href: ROUTES.EMPLOYEES.LIST, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
      { label: "Contracts", href: ROUTES.CONTRACTS.LIST, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
      { label: "Departments", href: "/departments", roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
      { label: "Working Schedule", href: ROUTES.SCHEDULES, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
    ],
  },
  {
    label: "Attendance",
    href: ROUTES.ATTENDANCE,
    icon: Clock,
    roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"],
  },
  {
    label: "Time Off",
    icon: CalendarDays,
    roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"],
    subItems: [
      { label: "Time Off Requests", href: ROUTES.TIMEOFF.REQUESTS, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER", "EMPLOYEE"] },
      { label: "Time Off Types", href: "/timeoff/types", roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
      { label: "Allocations", href: ROUTES.TIMEOFF.ALLOCATIONS, roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"] },
    ],
  },
  {
    label: "Payroll",
    icon: CreditCard,
    roles: ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"],
    subItems: [
      { label: "Payruns", href: ROUTES.PAYROLL.PAYRUNS, matchPrefix: "/payroll/payruns", roles: ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"] },
      { label: "Payslips", href: ROUTES.PAYROLL.PAYSLIPS, matchPrefix: "/payroll/payslips", roles: ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"] },
      { label: "Structures", href: ROUTES.PAYROLL.STRUCTURES, matchPrefix: "/payroll/structures", roles: ["ADMIN", "HR_PAYROLL_MANAGER"] },
      { label: "Rules", href: "/payroll/rules", matchPrefix: "/payroll/rules", roles: ["ADMIN", "HR_PAYROLL_MANAGER"] },
    ],
  },
  {
    label: "Users & Access",
    href: ROUTES.USERS,
    icon: ShieldCheck,
    roles: ["ADMIN"],
  },
  {
    label: "System Settings",
    href: ROUTES.SETTINGS,
    icon: Sliders,
    roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"],
  },
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

  // Submenus are collapsed by default ({}) unless auto-expanded by active route
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // Auto-expand menu section ONLY if a child path is active
  useEffect(() => {
    ALL_NAV_ITEMS.forEach((item) => {
      if (item.subItems && isParentNavActive(item, pathname)) {
        setExpandedMenus((prev) => ({ ...prev, [item.label]: true }));
      }
    });
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleRoleChange = async (newRole: Role) => {
    await switchRole(newRole);
    setRoleMenuOpen(false);
    router.push(ROUTES.DASHBOARD);
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
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar — uses CSS vars so light/dark mode is handled centrally */}
      <aside
        style={{
          backgroundColor: "var(--sidebar-bg)",
          color: "var(--sidebar-fg)",
          borderColor: "var(--sidebar-border)",
        }}
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between backdrop-blur-xl border-r shadow-2xl transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div>
          <div
            style={{ borderColor: "var(--sidebar-border)" }}
            className="flex h-16 items-center justify-between px-5 border-b"
          >
            <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-900/30 apple-press">
                <CreditCard className="h-4.5 w-4.5" strokeWidth={1.75} />
              </div>
              <div className="leading-tight">
                <span
                  style={{ color: "var(--sidebar-fg)" }}
                  className="text-sm font-bold tracking-tight font-brand group-hover:opacity-80 transition-opacity"
                >
                  PeoplePay360
                </span>
                <span
                  style={{ color: "var(--sidebar-muted)" }}
                  className="block text-[10px] font-semibold tracking-wider uppercase opacity-80"
                >
                  HR &amp; Payroll Ops
                </span>
              </div>
            </Link>
            {onMobileClose && (
              <button
                onClick={onMobileClose}
                style={{ color: "var(--sidebar-muted)" }}
                className="rounded-lg p-1.5 hover:opacity-80 transition-opacity md:hidden apple-press"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav id="sidebar-nav" className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]" suppressHydrationWarning>
            {ALL_NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
              const Icon = item.icon;
              const parentActive = isParentNavActive(item, pathname);
              const isExpanded = expandedMenus[item.label] ?? false;
              const visibleSubItems = (item.subItems || []).filter((sub) => sub.roles.includes(role));
              const activeSubItem = visibleSubItems.length > 0 ? getActiveSubItem(visibleSubItems, pathname) : null;

              if (visibleSubItems.length > 0) {
                return (
                  <div key={item.label} className="space-y-0.5">
                    <button
                      onClick={() => toggleExpand(item.label)}
                      style={
                        parentActive
                          ? {
                              backgroundColor: "oklch(55% 0.17 178 / 0.14)",
                              color: "var(--sidebar-active-fg)",
                            }
                          : { color: "var(--sidebar-fg)" }
                      }
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5 apple-press cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={parentActive ? { color: "var(--sidebar-active-fg)" } : { color: "var(--sidebar-muted)" }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                        >
                          <Icon className="h-4 w-4 shrink-0" strokeWidth={parentActive ? 2 : 1.5} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" strokeWidth={1.5} />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 opacity-70" strokeWidth={1.5} />
                      )}
                    </button>

                    {/* Submenu Dropdown Container */}
                    {isExpanded && (
                      <div className="ml-4 pl-3 border-l border-teal-500/20 space-y-1 py-1">
                        {visibleSubItems.map((sub) => {
                          const subActive = activeSubItem?.href === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onMobileClose}
                              style={
                                subActive
                                  ? {
                                      backgroundColor: "oklch(55% 0.17 178 / 0.18)",
                                      color: "var(--sidebar-active-fg)",
                                      borderColor: "oklch(55% 0.17 178 / 0.3)",
                                    }
                                  : { color: "var(--sidebar-muted)" }
                              }
                              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all apple-press ${
                                subActive ? "font-semibold border shadow-2xs" : "hover:opacity-100 hover:text-white"
                              }`}
                            >
                              <span className="truncate">{sub.label}</span>
                              {subActive && (
                                <span
                                  style={{ backgroundColor: "var(--sidebar-active-fg)" }}
                                  className="h-1.5 w-1.5 rounded-full opacity-90 shrink-0 ml-2"
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href || item.label}
                  href={item.href || "#"}
                  onClick={onMobileClose}
                  style={
                    parentActive
                      ? {
                          backgroundColor: "oklch(55% 0.17 178 / 0.18)",
                          color: "var(--sidebar-active-fg)",
                          borderColor: "oklch(55% 0.17 178 / 0.3)",
                        }
                      : { color: "var(--sidebar-muted)" }
                  }
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all apple-press ${
                    parentActive ? "border font-semibold shadow-xs" : "hover:opacity-90 hover:text-white"
                  }`}
                >
                  <div
                    style={parentActive ? { color: "var(--sidebar-active-fg)" } : { color: "var(--sidebar-muted)" }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={parentActive ? 2 : 1.5} />
                  </div>
                  <span>{item.label}</span>
                  {parentActive && (
                    <span
                      style={{ backgroundColor: "var(--sidebar-active-fg)" }}
                      className="ml-auto h-1.5 w-1.5 rounded-full opacity-80"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: Persona / Role Switcher & Red Sign Out Button */}
        <div
          id="sidebar-persona"
          style={{ borderColor: "var(--sidebar-border)" }}
          className="p-3 border-t flex flex-col gap-2.5"
          suppressHydrationWarning
        >
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              style={{
                backgroundColor: "oklch(100% 0 0 / 0.06)",
                borderColor: "var(--sidebar-border)",
                color: "var(--sidebar-fg)",
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border hover:opacity-90 apple-press shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{
                    backgroundColor: "oklch(55% 0.17 178 / 0.18)",
                    borderColor: "oklch(55% 0.17 178 / 0.35)",
                    color: "var(--sidebar-active-fg)",
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold shadow-inner"
                  suppressHydrationWarning
                >
                  {user?.firstName && user?.lastName
                    ? `${user.firstName[0]}${user.lastName[0]}`
                    : user?.firstName?.[0] || "AS"}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    style={{ color: "var(--sidebar-fg)" }}
                    className="truncate text-xs font-semibold"
                    suppressHydrationWarning
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p
                    style={{ color: "var(--sidebar-active-fg)" }}
                    className="truncate text-[10px] font-medium tracking-wide opacity-90 uppercase"
                    suppressHydrationWarning
                  >
                    {role.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <ChevronDown
                style={{ color: "var(--sidebar-muted)" }}
                className="h-3.5 w-3.5 shrink-0 ml-1"
                strokeWidth={1.5}
              />
            </button>

            {roleMenuOpen && (
              <div
                style={{
                  backgroundColor: "var(--sidebar-bg)",
                  borderColor: "var(--sidebar-border)",
                }}
                className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border backdrop-blur-xl p-2 shadow-2xl shadow-black/60 z-50 animate-in fade-in"
              >
                <div
                  style={{ color: "var(--sidebar-muted)" }}
                  className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                >
                  Simulate Role (RBAC)
                </div>
                <div className="space-y-0.5">
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleChange(r.role)}
                      style={
                        role === r.role
                          ? {
                              backgroundColor: "var(--sidebar-active-bg)",
                              color: "var(--sidebar-active-fg)",
                              borderColor: "oklch(55% 0.17 178 / 0.35)",
                            }
                          : { color: "var(--sidebar-muted)" }
                      }
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors apple-press cursor-pointer ${
                        role === r.role ? "font-semibold border" : "hover:opacity-90"
                      }`}
                    >
                      <span>{r.label}</span>
                      {role === r.role && (
                        <ShieldCheck
                          style={{ color: "var(--sidebar-active-fg)" }}
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Prominent Red Sign Out Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 transition-all apple-press cursor-pointer shadow-2xs"
          >
            <LogOut className="h-4 w-4 text-red-500" strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

