"use client";

import React, { useState } from "react";
import { Check, X, Search } from "lucide-react";
import { TimeOffRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { timeoffService } from "@/services/timeoffService";
import { Table, Column } from "@/components/common/Table";
import { EmployeeCell } from "@/components/common/EmployeeCell";
import { StatusBadge } from "@/components/common/StatusBadge";

interface LeaveRequestsTableProps {
  requests: TimeOffRequest[];
  onStatusChange: (updated: TimeOffRequest) => void;
  onRowClick?: (request: TimeOffRequest) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function LeaveRequestsTable({ requests, onStatusChange, onRowClick, pagination }: LeaveRequestsTableProps) {
  const { user, hasRole } = useAuth();
  const [filter, setFilter] = useState<string>("ALL");
  const [scope, setScope] = useState<"ALL" | "MY_TEAM">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const updated = await timeoffService.approveRequest(id);
      onStatusChange(updated);
    } catch (err) {
      console.error("Failed to approve leave", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefuse = async (id: string) => {
    setProcessingId(id);
    try {
      const updated = await timeoffService.refuseRequest(id, "Refused by HR Manager");
      onStatusChange(updated);
    } catch (err) {
      console.error("Failed to refuse leave", err);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    // Scope filter (My Team)
    if (scope === "MY_TEAM" && user) {
      const userDept = (user as any).department;
      if (userDept && r.employeeName && !r.employeeName.toLowerCase().includes(user.firstName.toLowerCase())) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = r.employeeName?.toLowerCase().includes(query);
      const matchCode = r.employeeCode?.toLowerCase().includes(query);
      const matchType = r.timeOffTypeName?.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchType) return false;
    }

    // Status tab filter
    if (filter === "ALL") return true;
    if (filter === "PENDING") return r.status === "CONFIRM" || r.status === "DRAFT";
    return r.status === filter;
  });

  const getTabCount = (tab: string) => {
    if (tab === "ALL") return requests.length;
    if (tab === "PENDING") return requests.filter((r) => r.status === "CONFIRM" || r.status === "DRAFT").length;
    return requests.filter((r) => r.status === tab).length;
  };

  const canApprove = hasRole(["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"]);

  const columns: Column<TimeOffRequest>[] = [
    {
      header: "Employee",
      width: "28%",
      render: (r) => (
        <EmployeeCell name={r.employeeName} subtext={r.employeeCode} />
      ),
    },
    {
      header: "Type",
      width: "18%",
      render: (r) => (
        <span className="font-medium text-[var(--foreground)] text-xs">
          {r.timeOffTypeName}
        </span>
      ),
    },
    {
      header: "Dates",
      width: "20%",
      render: (r) => (
        <span className="text-[var(--muted-foreground)] tabular-nums text-xs">
          {r.startDate} → {r.endDate}
        </span>
      ),
    },
    {
      header: "Duration",
      width: "10%",
      align: "center",
      render: (r) => (
        <span className="font-bold text-[var(--foreground)] tabular-nums text-xs">
          {r.requestedUnits}d
        </span>
      ),
    },
    {
      header: "Status",
      width: "12%",
      align: "center",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: "Actions",
      width: "12%",
      align: "right",
      render: (r) =>
        r.status === "CONFIRM" && canApprove ? (
          <div className="inline-flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleApprove(r.id)}
              disabled={processingId === r.id}
              className="p-1.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-500/20 border border-teal-500/30 transition-all cursor-pointer apple-press"
              title="Approve Request"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => handleRefuse(r.id)}
              disabled={processingId === r.id}
              className="p-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer apple-press"
              title="Refuse Request"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onRowClick && onRowClick(r)}
            className="px-2.5 py-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg border border-teal-500/20 transition-all cursor-pointer apple-press"
          >
            View Details
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Apple Segmented Filter Tabs */}
      {/* Wireframe Filter & Scope Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
        {/* All vs My Team scope filter & Search box */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center p-0.5 rounded-xl border border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setScope("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scope === "ALL"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setScope("MY_TEAM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scope === "MY_TEAM"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Team
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-medium"
            />
          </div>
        </div>

        {/* Status Lifecycle Segmented Tabs */}
        <div className="apple-segmented-track max-w-full overflow-x-auto inline-flex items-center gap-1 p-1">
          {["ALL", "PENDING", "APPROVED", "REFUSED"].map((tab) => {
            const count = getTabCount(tab);
            const isSelected = filter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`apple-segmented-item inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold cursor-pointer ${
                  isSelected
                    ? "active text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <span>{tab === "ALL" ? "All Status" : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums transition-colors ${
                    isSelected
                      ? "bg-[var(--accent)]/15 text-[var(--primary)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        onRowClick={onRowClick}
        pagination={pagination}
        minWidth="min-w-[640px]"
        emptyMessage="No time-off requests found in this queue."
        emptySubtitle="Check back later or change your filter tab."
      />
    </div>
  );
}
