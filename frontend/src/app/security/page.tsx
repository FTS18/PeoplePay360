"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Database, KeyRound, Server } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function SecurityCompliancePage() {
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
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>Bank-Grade Infrastructure Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-heading">
            Security, Cryptography &amp; Compliance
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Zero-Trust Architecture • SOC 2 Type II Certified Principles • ISO/IEC 27001
          </p>
        </div>

        {/* Security Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Strict method-level security annotations enforcing authorization across 5 roles (`SYSTEM_ADMIN`, `HR_MANAGER`, `PAYROLL_OFFICER`, `DEPARTMENT_MANAGER`, `EMPLOYEE`).
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Database className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">PostgreSQL Transactional Integrity</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Atomic `@Transactional` database boundaries preventing partial payrun state corruptions and double disbursal risks.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Server className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Zero-Float Financial Math</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Replaces IEEE 754 floating-point numbers with strict `BigDecimal` currency math to eliminate fraction rounding losses.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">GiST Range Exclusion Indexes</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Database-level constraint guarantees preventing overlapping employment contract intervals for a single workforce profile.
            </p>
          </div>
        </div>

        {/* Security Policy Details */}
        <div className="space-y-6 text-xs text-stone-700 leading-relaxed border-t border-stone-200 pt-8">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-stone-900 font-heading">Vulnerability Reporting &amp; Disclosure</h2>
            <p>
              Security researchers and enterprise administrators can report suspected system vulnerabilities to our dedicated security engineering team at <code className="bg-stone-100 px-2 py-0.5 rounded font-mono text-teal-800">security@peoplepay360.internal</code>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>&copy; 2026 PeoplePay360 Inc. All rights reserved.</span>
          <Link href={ROUTES.LEGAL.COOKIES} className="text-teal-700 hover:underline font-semibold">
            View Cookie Policy $\rightarrow$
          </Link>
        </div>
      </footer>
    </div>
  );
}
