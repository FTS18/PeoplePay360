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
        <div className="flex items-center gap-2 text-xs text-(--muted-foreground)">
          <span className="font-medium">Group by:</span>
          <div className="inline-flex rounded-lg border border-(--border) bg-(--card) p-0.5">
            <button
              onClick={() => setGroupBy("department")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                groupBy === "department"
                  ? "bg-(--secondary) text-(--foreground) shadow-xs"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              Department
            </button>
            <button
              onClick={() => setGroupBy("status")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                groupBy === "status"
                  ? "bg-(--secondary) text-(--foreground) shadow-xs"
                  : "text-(--muted-foreground) hover:text-(--foreground)"
              }`}
            >
              Status
            </button>
          </div>
        </div>
        <span className="text-xs text-(--muted-foreground)">
          {employees.length} employees across {lanes.length} lanes
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {lanes.map((lane) => (
          <div
            key={lane.key}
            className="flex w-72 min-w-[288px] shrink-0 flex-col rounded-xl border border-(--border) bg-(--card)/50 p-3 shadow-xs"
          >
            <div className="mb-3 flex items-center justify-between border-b border-(--border)/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-(--primary)" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-(--foreground)">
                  {lane.title}
                </h3>
              </div>
              <span className="rounded-full bg-(--secondary) px-2 py-0.5 text-[11px] font-semibold text-(--secondary-foreground)">
                {lane.items.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2.5">
              {lane.items.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-(--border) p-4 text-center text-xs text-(--muted-foreground)">
                  No employees in this lane
                </div>
              ) : (
                lane.items.map((emp) => {
                  const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <div
                      key={emp.id}
                      className="group rounded-lg border border-(--border) bg-(--card) p-3 shadow-xs transition-all hover:border-(--border)/80 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--secondary) text-xs font-bold text-(--foreground)">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={ROUTES.EMPLOYEES.DETAIL(emp.id)}
                              className="text-xs font-semibold text-(--foreground) group-hover:text-(--primary) group-hover:underline"
                            >
                              {emp.firstName} {emp.lastName}
                            </Link>
                            <p className="text-[11px] text-(--muted-foreground) line-clamp-1">
                              {emp.jobPosition}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={emp.status} />
                      </div>

                      <div className="mt-3 space-y-1.5 border-t border-(--border)/60 pt-2 text-[11px] text-(--muted-foreground)">
                        <div className="flex items-center justify-between">
                          <span>{emp.employeeCode}</span>
                          {groupBy === "status" && (
                            <span className="font-medium text-(--foreground)">
                              {emp.department}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                          <span className="truncate">{emp.workEmail}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-end border-t border-(--border)/40 pt-2">
                        <Link
                          href={ROUTES.EMPLOYEES.DETAIL(emp.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-(--primary) hover:underline"
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
