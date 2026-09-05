"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LayoutDashboard, Home } from "lucide-react";

const SEGMENT_OVERRIDES: Record<string, string> = {
  timeoff: "Time Off",
  types: "Time Off Types",
  allocations: "Leave Allocations",
  payruns: "Payruns",
  payslips: "Payslips",
  structures: "Salary Structures & Rules",
  configuration: "Salary Structures & Rules",
  schedules: "Working Schedule",
  users: "Users & Access",
};

export function Breadcrumb() {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/dashboard") {
    return (
      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full border border-[var(--border)] dark:border-[var(--border-subtle)] bg-stone-100/70 dark:bg-[var(--muted)] backdrop-blur-xs text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-xs">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-500/20 text-teal-600 dark:text-teal-400">
          <LayoutDashboard className="h-3 w-3" strokeWidth={1.75} />
        </div>
        <span className="tracking-tight truncate max-w-[100px] sm:max-w-none">Dashboard</span>
      </div>
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav
      className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full border border-[var(--border)] dark:border-[var(--border-subtle)] bg-stone-100/70 dark:bg-[var(--muted)] backdrop-blur-xs text-xs font-medium text-[var(--muted-foreground)] shadow-xs max-w-[160px] sm:max-w-none truncate"
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-700/60 transition-colors apple-press"
      >
        <Home className="h-3 w-3" strokeWidth={1.5} />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const formatted =
          SEGMENT_OVERRIDES[segment.toLowerCase()] ||
          segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-stone-400/80 shrink-0" strokeWidth={1.5} />
            {isLast ? (
              <span className="font-semibold text-[var(--foreground)] tracking-tight truncate max-w-[90px] sm:max-w-none">{formatted}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-stone-800 dark:hover:text-stone-200 transition-colors truncate max-w-[70px] sm:max-w-none"
              >
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
