"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
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
  const [paying, setPaying] = useState<boolean>(false);
  const [emailing, setEmailing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const steps: { key: PayrunStatus; label: string }[] = [
    { key: "DRAFT", label: "Draft" },
    { key: "COMPUTED", label: "Computed" },
    { key: "VALIDATED", label: "Validated" },
    { key: "PAID", label: "Paid & Locked" },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === payrun.status);

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

  const handlePay = async () => {
    setPaying(true);
    setMessage(null);
    try {
      const res = await payrollService.markAsPaid(payrun.id);
      onPayrunUpdated(res);
      setMessage("Payrun validated, disbursed, and permanently locked by PostgreSQL immutability guards.");
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
      setMessage(res || "Bulk payslip emails dispatched.");
    } catch (err: any) {
      setMessage(err?.message || "Email dispatch failed");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx || payrun.status === step.key;
            const isCurrent = payrun.status === step.key;
            return (
              <React.Fragment key={step.key}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isCompleted
                        ? "bg-teal-700 text-white"
                        : "bg-stone-100 text-stone-400 border border-stone-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent ? "text-stone-900 font-semibold" : "text-stone-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-6 h-0.5 ${
                      idx < currentStepIdx ? "bg-teal-700" : "bg-stone-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {payrun.status === "DRAFT" && (
            <button
              onClick={handleCompute}
              disabled={computing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
              {computing ? "Computing Engine..." : "Compute Batch Run"}
            </button>
          )}

          {(payrun.status === "COMPUTED" || payrun.status === "VALIDATED") &&
            (canFinalize ? (
              <button
                onClick={handlePay}
                disabled={paying}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer disabled:opacity-60"
              >
                <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {paying ? "Locking & Disbursing..." : "Finalize & Mark as Paid"}
              </button>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 text-stone-500 text-xs font-medium rounded-xl border border-stone-200 cursor-not-allowed"
                title="Only HR Payroll Manager or Admin can finalize and disburse payroll."
              >
                <Lock className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                <span>Awaiting Manager Approval</span>
              </div>
            ))}

          {payrun.status === "PAID" && (
            <button
              onClick={handleSendEmails}
              disabled={emailing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-xl shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
              {emailing ? "Dispatching..." : "Dispatch PDF Payslips"}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" strokeWidth={1.5} />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
