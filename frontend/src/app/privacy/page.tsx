"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Enterprise Data Privacy Standard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-heading">
            Privacy Policy &amp; Data Governance
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Last Updated: September 6, 2026 • Version 2.0 • ISO/IEC 27001 &amp; GDPR Aligned
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">1. Operational Scope &amp; Purpose</h2>
            <p>
              PeoplePay360 (&quot;Platform&quot;, &quot;System&quot;, or &quot;We&quot;) processes organizational workforce data exclusively to provide automated HR management, biometric attendance verification, contract term tracking, time-off balance ledgers, and deterministic multi-tier payroll calculations.
            </p>
            <p>
              We act as a strict Data Processor under applicable privacy laws. Client enterprise entities remain the sole Data Controllers responsible for obtaining lawful employee consent for payroll processing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">2. Information We Process</h2>
            <p>To execute accurate HR and payroll operations, PeoplePay360 collects and processes:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-teal-600">
              <li><strong>Master Employee Profiles:</strong> Full name, employee identification code, official email address, emergency contacts, job title, and department assignment.</li>
              <li><strong>Financial &amp; Banking Credentials:</strong> Bank account numbers, routing/IFSC codes, tax identification numbers (PAN/TIN), and contractual wage parameters.</li>
              <li><strong>Biometric Shift &amp; Attendance Logs:</strong> Timestamped punch clock records, 8-hour shift compliance metrics, and supervisor audit override logs with documented justifications.</li>
              <li><strong>Time-Off Ledger Records:</strong> Leave allocation quotas, historical leave applications, medical leave attachments, and manager approval timestamps.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">3. Data Security &amp; Encryption Standards</h2>
            <p>
              All workforce data processed through PeoplePay360 is protected by multi-layered defensive security measures:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl border border-stone-200 bg-white">
                <div className="font-bold text-stone-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>Encryption in Transit &amp; Rest</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">TLS 1.3 for all HTTP API interactions and AES-256 for PostgreSQL database storage.</p>
              </div>
              <div className="p-3.5 rounded-2xl border border-stone-200 bg-white">
                <div className="font-bold text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Zero PII Log Masking</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Automatic zero-PII sanitization on application logs to prevent secret leakages.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">4. Data Retention &amp; Audit Integrity</h2>
            <p>
              Financial compliance regulations require payroll disbursal logs and payslip calculations to be retained in an immutable state for historical audit queries. Calculated payslip line items (`BigDecimal` precision) and tax deduction snapshots are archived in write-once audit storage and are non-editable once payruns reach `PAID` status.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">5. Employee Data Rights</h2>
            <p>
              Employees managed within PeoplePay360 hold the right to inspect their master profile data, inspect leave allocation ledgers, and download official PDF payslips at any time via the Employee Self-Service portal. Profile correction requests are submitted through department managers or HR administrators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">6. Inquiries &amp; Data Protection Contact</h2>
            <p>
              For data protection inquiries or audit compliance verification, contact our Data Governance Desk at:
            </p>
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 font-mono text-stone-800">
              Email: privacy@peoplepay360.internal • Security Desk: +1 (800) 360-PAYROLL
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>&copy; 2026 PeoplePay360 Inc. All rights reserved.</span>
          <Link href={ROUTES.LEGAL.TERMS} className="text-teal-700 hover:underline font-semibold">
            View Terms of Service $\rightarrow$
          </Link>
        </div>
      </footer>
    </div>
  );
}
