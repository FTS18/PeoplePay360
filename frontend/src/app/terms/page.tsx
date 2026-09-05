"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-stone-900 font-sans antialiased selection:bg-teal-500/20 selection:text-teal-900">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-stone-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-heading font-extrabold text-sm text-stone-900">PeoplePay360</span>
          </div>
        </div>
      </header>

      {/* Main Legal Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Title Header */}
        <div className="space-y-3 pb-8 border-b border-stone-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>Enterprise Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-heading">
            Terms of Service &amp; Operational Guarantee
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Last Updated: September 6, 2026 • Version 2.0 • Binding Platform Agreement
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">1. Acceptance &amp; Platform Authority</h2>
            <p>
              By accessing, initializing, or operating the PeoplePay360 HR and Payroll system, enterprise clients and authorized personnel agree to comply strictly with these Terms of Service. Access is controlled via Role-Based Access Control (RBAC) enforced at backend controller guards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">2. Deterministic Payroll Engine Rules</h2>
            <p>
              PeoplePay360 provides a zero-float, high-precision calculation engine utilizing `BigDecimal` arithmetic. The platform executes configured salary structures in sequential rule order (e.g., Sequence 10: Basic, Sequence 20: HRA, Sequence 30: Deductions).
            </p>
            <p>
              Enterprise clients remain responsible for validating custom formula expressions (such as Python formulas `BASIC * 0.40`) prior to initiating payruns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">3. Contract Range &amp; GiST Exclusion Enforcement</h2>
            <p>
              To maintain audit validity, PeoplePay360 enforces PostgreSQL range exclusion guards (`GiST indexes`) on employee contracts. Concurrent contracts with overlapping date intervals for a single employee are rejected by database constraint rules.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">4. Audit Overrides &amp; Supervisor Liability</h2>
            <p>
              Manual attendance corrections or shift overrides must include a logged supervisor reference ID and override reason. Overrides are stored in permanent audit tables and surfaced in executive dashboard logs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">5. Availability &amp; SLA Terms</h2>
            <p>
              PeoplePay360 operates under a 99.9% uptime Service Level Agreement for core API endpoints, background payrun calculation queues, and server-side PDF payslip compilation workers.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>&copy; 2026 PeoplePay360 Inc. All rights reserved.</span>
          <Link href={ROUTES.LEGAL.SECURITY} className="text-teal-700 hover:underline font-semibold">
            View Security &amp; Compliance $\rightarrow$
          </Link>
        </div>
      </footer>
    </div>
  );
}
