import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ROUTES } from "@/config/routes";

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

export function RecentPayrunTable({ payruns }: RecentPayrunTableProps) {
  return (
    <div className="rounded-2xl border border-[oklch(92%_0.005_240)] bg-white overflow-hidden shadow-xs">
      <div className="flex items-center justify-between p-5 border-b border-[oklch(92%_0.005_240)]">
        <div>
          <h3 className="text-sm font-bold text-[oklch(20%_0.02_240)]">Recent Payruns</h3>
          <p className="text-xs text-[oklch(50%_0.02_240)]">Deterministic payroll disbursement cycles</p>
        </div>
        <Link
          href={ROUTES.PAYROLL.PAYRUNS}
          className="text-xs font-semibold text-[oklch(35%_0.08_195)] hover:text-[oklch(20%_0.04_195)] hover:underline flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[oklch(98%_0.005_240)] text-[oklch(50%_0.02_240)] border-b border-[oklch(92%_0.005_240)]">
            <tr>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px]">Reference</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px]">Period</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">Employees</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px] text-right">Disbursed</th>
              <th className="py-3 px-5 font-semibold uppercase tracking-wider text-[10px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[oklch(94%_0.005_240)]">
            {payruns.map((pr) => (
              <tr key={pr.id} className="hover:bg-[oklch(98.5%_0.005_240)] transition-colors">
                <td className="py-3.5 px-5 font-semibold text-[oklch(20%_0.02_240)]">
                  <Link
                    href={ROUTES.PAYROLL.PAYRUN_DETAIL(pr.id)}
                    className="hover:underline text-[oklch(25%_0.06_195)]"
                  >
                    {pr.reference}
                  </Link>
                </td>
                <td className="py-3.5 px-5 text-[oklch(40%_0.02_240)]">{pr.period}</td>
                <td className="py-3.5 px-5 text-center tabular-nums font-medium">{pr.employees}</td>
                <td className="py-3.5 px-5 text-right tabular-nums font-bold text-[oklch(20%_0.02_240)]">
                  {pr.totalDisbursed}
                </td>
                <td className="py-3.5 px-5 text-center">
                  <StatusBadge status={pr.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
