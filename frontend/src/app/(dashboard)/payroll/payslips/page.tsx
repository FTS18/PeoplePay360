"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Eye, RefreshCw, FileText, Search } from "lucide-react";
import { payrollService } from "@/services/payrollService";
import { Payslip } from "@/types";
import { PayslipDetailModal } from "@/components/modules/payroll/PayslipDetailModal";
import { PayrollSubNav } from "@/components/modules/payroll/PayrollSubNav";

export default function PayslipsPage() {
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams?.get("employeeId") || "";

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getPayslips(undefined, 0, 50, employeeIdParam || undefined);
      setPayslips(res.content || []);
    } catch (err) {
      console.error("Failed to fetch payslips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [employeeIdParam]);

  const formatMoney = (val?: number) => {
    const num = val != null ? Number(val) : 0;
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleOpenDetail = async (slip: Payslip) => {
    try {
      const details = await payrollService.getPayslipDetails(slip.id);
      setSelectedPayslip(details);
    } catch {
      setSelectedPayslip(slip);
    }
  };

  const filtered = payslips.filter(
    (p) =>
      p.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      p.employeeCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PayrollSubNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Payslips Archive</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Access itemized payment settlements, salary slips, and dynamic PDF document exports.
          </p>
        </div>
        <button
          onClick={fetchPayslips}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-xl border border-stone-200 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
          Refresh
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by employee name or code..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/75 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4 text-right">Gross Salary</th>
                <th className="py-3.5 px-4 text-right">Deductions</th>
                <th className="py-3.5 px-4 text-right">Net Payable</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No payslips found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{p.employeeName}</div>
                      <div className="text-xs text-stone-400">{p.employeeCode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 text-xs font-medium">
                      {p.periodStart} to {p.periodEnd}
                    </td>
                    <td className="py-3.5 px-4 text-right text-stone-800 font-medium">
                      {formatMoney(p.grossSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-700 font-medium">
                      -{formatMoney(p.totalDeductions)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-teal-950">
                      {formatMoney(p.netSalary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(p)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-teal-800 hover:bg-teal-50 border border-stone-200 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <a
                          href={payrollService.getPdfUrl(p.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-stone-600 hover:text-teal-800 hover:bg-teal-50 border border-stone-200 transition-colors cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PayslipDetailModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
    </div>
  );
}
