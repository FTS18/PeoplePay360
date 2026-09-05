"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { payrollService } from "@/services/payrollService";
import { Payrun, Payslip } from "@/types";
import { PayrunLifecycleBanner } from "@/components/modules/payroll/PayrunLifecycleBanner";
import { PayrunSummaryCards } from "@/components/modules/payroll/PayrunSummaryCards";
import { PayrunPayslipsTable } from "@/components/modules/payroll/PayrunPayslipsTable";
import { PayslipDetailModal } from "@/components/modules/payroll/PayslipDetailModal";
import { PayrunWarningsWidget } from "@/components/modules/payroll/PayrunWarningsWidget";
import { ROUTES } from "@/config/routes";

export default function PayrunDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [payrun, setPayrun] = useState<Payrun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const loadPayrunData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [runRes, slipsRes] = await Promise.all([
        payrollService.getPayrunById(id),
        payrollService.getPayslips(id),
      ]);
      setPayrun(runRes);
      setPayslips(slipsRes.content || []);
    } catch (err) {
      console.error("Failed to load payrun details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrunData();
  }, [id]);

  const handlePayrunUpdated = (updated: Payrun) => {
    setPayrun(updated);
    payrollService.getPayslips(id).then((res) => setPayslips(res.content || []));
  };

  const handleViewPayslip = async (slip: Payslip) => {
    try {
      const full = await payrollService.getPayslipDetails(slip.id);
      setSelectedPayslip(full);
    } catch {
      setSelectedPayslip(slip);
    }
  };

  if (loading && !payrun) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
        <p className="text-xs">Loading payrun batch details...</p>
      </div>
    );
  }

  if (!payrun) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p className="text-sm font-semibold text-foreground">Payrun batch not found.</p>
        <Link 
          href={ROUTES.PAYROLL.PAYRUNS} 
          className="text-teal-700 dark:text-teal-400 text-xs mt-2 inline-block font-semibold hover:underline"
        >
          Back to Payruns Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={ROUTES.PAYROLL.PAYRUNS}
          className="apple-press inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Back to Payruns Directory</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{payrun.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Period: {payrun.periodStart} to {payrun.periodEnd} | Reference: <span className="tabular-nums">PAYRUN-{payrun.id.slice(0, 8)}</span>
            </p>
          </div>
          <button
            onClick={loadPayrunData}
            disabled={loading}
            className="apple-press self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-full border border-stone-300/80 dark:border-stone-700/80 shadow-apple-sm cursor-pointer transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} strokeWidth={1.5} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Banner */}
      <PayrunLifecycleBanner payrun={payrun} onPayrunUpdated={handlePayrunUpdated} />

      {/* Summary Cards */}
      <PayrunSummaryCards payrun={payrun} />

      {/* Pre-Finalization Warnings */}
      <PayrunWarningsWidget payrun={payrun} payslips={payslips} />

      {/* Payslips Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Itemized Employee Payslips</h2>
          <span className="text-xs text-muted-foreground tabular-nums font-medium">{payslips.length} Total Payslips Compiled</span>
        </div>
        <PayrunPayslipsTable payslips={payslips} onSelectPayslip={handleViewPayslip} />
      </div>

      {/* Payslip Modal */}
      <PayslipDetailModal payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
    </div>
  );
}
