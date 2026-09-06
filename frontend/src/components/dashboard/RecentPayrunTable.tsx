import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table, Column } from "@/components/common/Table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";
import { formatReferenceTitle } from "@/utils/format";

interface PayrunSummary {
  id: string;
  reference: string;
  period: string;
  employees: number;
  totalDisbursed: string;
  status: string;
}

interface RecentPayrunTableProps {
  payruns: PayrunSummary[];
}

function formatPeriodDisplay(period: string) {
  if (!period) return "—";
  const parts = period.split(" – ");
  if (parts.length === 2) {
    const d1 = parts[0].split("-");
    const d2 = parts[1].split("-");
    if (d1.length === 3 && d2.length === 3) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mIdx = parseInt(d1[1], 10) - 1;
      const month = monthNames[mIdx] || d1[1];
      return `${month} ${d1[2]} – ${d2[2]}, ${d1[0]}`;
    }
  }
  return period;
}

export function RecentPayrunTable({ payruns }: RecentPayrunTableProps) {
  const columns: Column<PayrunSummary>[] = [
    {
      header: "Reference",
      width: "30%",
      render: (pr) => (
        <Link
          href={ROUTES.PAYROLL.PAYRUN_DETAIL(pr.id)}
          className="text-[var(--foreground)] font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate block"
        >
          {formatReferenceTitle(pr.reference)}
        </Link>
      ),
    },
    {
      header: "Period",
      width: "28%",
      render: (pr) => (
        <span className="text-[var(--muted-foreground)] tabular-nums whitespace-nowrap block text-xs">
          {formatPeriodDisplay(pr.period)}
        </span>
      ),
    },
    {
      header: "Employees",
      width: "12%",
      align: "center",
      render: (pr) => (
        <span className="tabular-nums font-semibold text-[var(--foreground)]" suppressHydrationWarning>
          {pr.employees}
        </span>
      ),
    },
    {
      header: "Disbursed",
      width: "16%",
      align: "right",
      render: (pr) => (
        <span className="tabular-nums font-bold text-teal-700 dark:text-teal-400" suppressHydrationWarning>
          {pr.totalDisbursed}
        </span>
      ),
    },
    {
      header: "Status",
      width: "14%",
      align: "center",
      render: (pr) => <StatusBadge status={pr.status} />,
    },
  ];

  return (
    <Table
      header={
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent Payruns</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Deterministic payroll disbursement cycles</p>
          </div>
          <Link
            href={ROUTES.PAYROLL.PAYRUNS}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors apple-press"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      }
      columns={columns}
      data={payruns}
      minWidth="min-w-[560px]"
      emptyMessage="No recent payrun cycles recorded."
      emptySubtitle="Completed payroll batches will appear here."
    />
  );
}
