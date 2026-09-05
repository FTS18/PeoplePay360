"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Mail, ChevronRight } from "lucide-react";
import { Employee } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";

interface EmployeeKanbanProps {
  employees: Employee[];
}

type GroupBy = "department" | "status";

export function EmployeeKanban({ employees }: EmployeeKanbanProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("department");

  const lanes = useMemo(() => {
    if (groupBy === "department") {
      const depts = Array.from(
        new Set(employees.map((e) => e.department || "Unassigned"))
      ).sort();
      return depts.map((dept) => ({
        key: dept,
        title: dept,
        items: employees.filter((e) => (e.department || "Unassigned") === dept),
      }));
    } else {
      const statuses: ("ACTIVE" | "INACTIVE")[] = ["ACTIVE", "INACTIVE"];
      return statuses.map((status) => ({
        key: status,
        title: status.replace("_", " "),
        items: employees.filter((e) => e.status === status),
      }));
    }
  }, [employees, groupBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Group by:</span>
          {/* Apple Segmented Switcher */}
          <div className="apple-segmented-track border border-stone-300/70 dark:border-stone-700/70 shadow-2xs">
            <button
              onClick={() => setGroupBy("department")}
              className={`apple-press apple-segmented-item ${groupBy === "department" ? "active" : ""}`}
            >
              Department
            </button>
            <button
              onClick={() => setGroupBy("status")}
              className={`apple-press apple-segmented-item ${groupBy === "status" ? "active" : ""}`}
            >
              Status
            </button>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {employees.length} employees across {lanes.length} lanes
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {lanes.map((lane) => (
          <div
            key={lane.key}
            className="flex w-72 min-w-[288px] shrink-0 flex-col rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-stone-100/50 dark:bg-stone-900/30 p-3.5 shadow-2xs"
          >
            <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] dark:border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                <h3 className="text-xs font-semibold tracking-tight text-foreground">
                  {lane.title}
                </h3>
              </div>
              <span className="rounded-full bg-stone-200/80 dark:bg-stone-800 px-2.5 py-0.5 text-[11px] font-semibold text-foreground shadow-2xs">
                {lane.items.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5">
              {lane.items.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-stone-200 dark:border-[var(--border-subtle)] p-4 text-center text-xs text-muted-foreground">
                  No employees in this lane
                </div>
              ) : (
                lane.items.map((emp) => {
                  const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <div
                      key={emp.id}
                      className="group rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-card p-3.5 shadow-apple-sm transition-all hover:shadow-apple-md hover:border-stone-300 dark:hover:border-stone-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] dark:bg-stone-800 border border-[var(--border)] dark:border-stone-700/80 text-xs font-bold text-foreground shadow-2xs">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={ROUTES.EMPLOYEES.DETAIL(emp.id)}
                              className="text-xs font-semibold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors"
                            >
                              {emp.firstName} {emp.lastName}
                            </Link>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {emp.jobPosition}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={emp.status} />
                      </div>

                      <div className="mt-3 space-y-1.5 border-t border-stone-200/70 dark:border-stone-800/80 pt-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="tabular-nums">{emp.employeeCode}</span>
                          {groupBy === "status" && (
                            <span className="font-medium text-foreground">
                              {emp.department}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 shrink-0 text-stone-400" strokeWidth={1.5} />
                          <span className="truncate">{emp.email}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-end border-t border-stone-200/60 dark:border-stone-800/60 pt-2">
                        <Link
                          href={ROUTES.EMPLOYEES.DETAIL(emp.id)}
                          className="apple-press inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
                        >
                          View Profile
                          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

