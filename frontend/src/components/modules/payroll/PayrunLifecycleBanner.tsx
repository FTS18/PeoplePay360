"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, ShieldCheck, Mail, Lock } from "lucide-react";
import { Payrun, PayrunStatus } from "@/types";
import { payrollService } from "@/services/payrollService";
import { useAuth } from "@/context/AuthContext";

interface PayrunLifecycleBannerProps {
  payrun: Payrun;
  onPayrunUpdated: (updated: Payrun) => void;
}

export function PayrunLifecycleBanner({ payrun, onPayrunUpdated }: PayrunLifecycleBannerProps) {
  const { hasRole } = useAuth();
  const canFinalize = hasRole(["ADMIN", "HR_PAYROLL_MANAGER"]);
  const [computing, setComputing] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [paying, setPaying] = useState<boolean>(false);
  const [emailing, setEmailing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCompute = async () => {
    setComputing(true);
    setMessage(null);
    try {
      const res = await payrollService.computeBatch(payrun.id);
      onPayrunUpdated(res);
      setMessage("Payroll batch computation finished successfully.");
    } catch (err: any) {
      setMessage(err?.message || "Computation failed");
    } finally {
      setComputing(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setMessage(null);
    try {
      const warnings = await payrollService.validatePayrun(payrun.id);
      setMessage(`Payrun validated successfully with ${warnings?.length || 0} warning items logged.`);
    } catch (err: any) {
      setMessage(err?.message || "Validation scan failed");
    } finally {
      setValidating(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    setMessage(null);
    try {
      const res = await payrollService.markAsPaid(payrun.id);
      onPayrunUpdated(res);
      setMessage("Payrun validated, disbursed, and permanently locked.");
    } catch (err: any) {
      setMessage(err?.message || "Payment finalization failed");
    } finally {
      setPaying(false);
    }
  };

  const handleSendEmails = async () => {
    setEmailing(true);
    setMessage(null);
    try {
      const res = await payrollService.sendPayslips(payrun.id);
      setMessage(typeof res === "string" ? res : "Bulk payslip emails dispatched asynchronously.");
    } catch (err: any) {
      setMessage(err?.message || "Email dispatch failed");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm space-y-5 text-foreground apple-specular">
      {/* Top Action Bar matching Wireframe 1B */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-border">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCompute}
            disabled={computing}
            className="apple-press inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{computing ? "COMPUTING..." : "COMPUTE"}</span>
          </button>

          <button
            onClick={handleValidate}
            disabled={validating}
            className="apple-press inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border transition-all cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{validating ? "VALIDATING..." : "VALIDATE"}</span>
          </button>

          {canFinalize && (
            <button
              onClick={handlePay}
              disabled={paying || payrun.status === "PAID"}
              className="apple-press inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl border border-border transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{paying ? "PROCESSING..." : "MARK PAID"}</span>
            </button>
          )}
        </div>

        {/* Right Purple Send Payslips Button matching Wireframe */}
        {canFinalize && (
          <button
            onClick={handleSendEmails}
            disabled={emailing}
            className="apple-press inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-900/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>{emailing ? "DISPATCHING..." : "SEND PAYSLIPS"}</span>
          </button>
        )}
      </div>

      {/* 2-Column Fields Grid matching Wireframe 1B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground font-medium">Name</span>
            <span className="font-bold text-foreground">{payrun.name}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground font-medium">Salary Structure</span>
            <span className="font-semibold text-foreground">{payrun.salaryStructureName || "Regular Salary"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground font-medium">Period</span>
            <span className="font-semibold text-foreground tabular-nums">{payrun.periodStart} — {payrun.periodEnd}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20">
            <span className="text-muted-foreground font-medium">Status</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">{payrun.status}</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" strokeWidth={1.5} />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
