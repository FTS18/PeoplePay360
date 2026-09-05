"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
  Layers,
  Zap,
  Clock,
  CreditCard,
  Calendar,
  Lock,
  Scale,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { HorizontalScrollSection, HorizontalScrollCardItem } from "@/components/ui/HorizontalScrollSection";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeaturePlayground } from "@/components/landing/FeaturePlayground";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { RoleMatrixSection } from "@/components/landing/RoleMatrixSection";
import { WorkflowsSection } from "@/components/landing/WorkflowsSection";

const HORIZONTAL_MODULES: HorizontalScrollCardItem[] = [
  {
    id: 1,
    badge: "Employee Directory",
    title: "Central Employee Profiles",
    subtitle: "Master Profiles & History",
    description: "Store employee demographics, department assignments, bank details, and job titles in one clean, structured directory.",
    metrics: [
      { label: "Active Profiles", value: "27,550+" },
      { label: "View Modes", value: "Kanban & Table" },
    ],
    icon: Users,
  },
  {
    id: 2,
    badge: "Contract Engine",
    title: "Contract Term Resolver",
    subtitle: "Active Period Matching",
    description: "Automatically matches the active contract for any payroll date range while preventing overlapping terms.",
    metrics: [
      { label: "Overlap Guard", value: "GiST Index" },
      { label: "Currency Math", value: "BigDecimal" },
    ],
    codeSnippet: "EXCLUDE USING gist (employee_id WITH =, daterange(start_date, end_date) WITH &&)",
    icon: FileText,
  },
  {
    id: 3,
    badge: "Attendance Tracking",
    title: "Shift Attendance & Audit",
    subtitle: "Daily Workday Logs",
    description: "Logs shift timestamps, flags late arrivals or missing check-outs, and records manager audit overrides.",
    metrics: [
      { label: "Shift Basis", value: "8.0 Hours" },
      { label: "Audit Logs", value: "Immutable" },
    ],
    icon: Clock,
  },
  {
    id: 4,
    badge: "Time-Off Management",
    title: "Leave Balances & Requests",
    subtitle: "Quota Ledgers",
    description: "Set up paid or unpaid leave policies, track annual balances, and automatically deduct approved leave.",
    metrics: [
      { label: "Leave Units", value: "Days or Hours" },
      { label: "Deduction", value: "On Approval" },
    ],
    icon: Calendar,
  },
  {
    id: 5,
    badge: "Salary Rules",
    title: "Flexible Payroll Computation",
    subtitle: "Sequential Rule Pipeline",
    description: "Calculates basic pay, allowances (HRA), deductions (PF, Tax), and net salary using ordered rules.",
    metrics: [
      { label: "Formulas", value: "Fixed, % & Custom" },
      { label: "Execution", value: "Sequential (10, 20...)" },
    ],
    codeSnippet: "NET = GROSS - (PF + TAX) | HRA = BASIC * 0.40",
    icon: Layers,
  },
  {
    id: 6,
    badge: "Payrun Validation",
    title: "Pre-Flight Payroll Scanner",
    subtitle: "Missing Data Audit",
    description: "Scans payruns for unlinked bank accounts, missing attendance, or duplicate payslips before finalizing payout.",
    metrics: [
      { label: "Audit Scans", value: "Automated" },
      { label: "Status Flow", value: "Draft -> Paid" },
    ],
    icon: CreditCard,
  },
  {
    id: 7,
    badge: "PDF & Email Dispatch",
    title: "Automated Payslip Delivery",
    subtitle: "Server PDF Generation",
    description: "Generates formatted payslip PDFs server-side and sends them out asynchronously via email.",
    metrics: [
      { label: "PDF Engine", value: "OpenPDF / iText" },
      { label: "Email Dispatch", value: "Async Task Queue" },
    ],
    icon: Zap,
  },
  {
    id: 8,
    badge: "Analytics",
    title: "Payroll Cost Reports",
    subtitle: "Real-Time Metrics",
    description: "Track total salary disbursals, department breakdowns, and attendance health across payroll periods.",
    metrics: [
      { label: "Total Disbursed", value: "Live Aggregate" },
      { label: "Department Costs", value: "Live Breakdowns" },
    ],
    icon: BarChart3,
  },
];

export default function LandingPage() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 20) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page min-h-screen bg-[#fafafa] text-stone-900 font-oswald antialiased selection:bg-teal-500/20 selection:text-teal-900 overflow-x-clip">
      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md transition-transform duration-300 ${
          isHeaderVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                P360
              </div>
              <span className="font-heading font-extrabold text-base tracking-tight text-stone-900">PeoplePay360</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
              <a href="#overview" className="hover:text-stone-900 transition-colors">Overview</a>
              <a href="#demo" className="hover:text-stone-900 transition-colors">Playground</a>
              <a href="#horizontal-modules" className="hover:text-stone-900 transition-colors">Features</a>
              <a href="#comparison" className="hover:text-stone-900 transition-colors">Comparison</a>
              <a href="#roles" className="hover:text-stone-900 transition-colors">Roles &amp; Access</a>
              <a href="#workflows" className="hover:text-stone-900 transition-colors">Workflows</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.LOGIN}
              className="apple-press hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.DASHBOARD}
              className="apple-press inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-black rounded-full shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <LandingHero />

      <FeaturePlayground />

      <div id="horizontal-modules" className="bg-[#f8fafc]">
        <HorizontalScrollSection
          title="Core Platform Features"
          subtitle="Scroll through the operational modules powering PeoplePay360."
          items={HORIZONTAL_MODULES}
        />
      </div>

      <ComparisonSection />

      <RoleMatrixSection />

      <WorkflowsSection />

      {/* CTA */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl border border-teal-900/80 bg-gradient-to-br from-[#062420] via-stone-900 to-[#0a3530] p-8 sm:p-14 text-center space-y-6 shadow-2xl overflow-hidden text-white">
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wide text-white font-anton max-w-2xl mx-auto">
              Streamline Your{" "}
              <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-4xl sm:text-6xl">
                HR &amp; Payroll
              </span>{" "}
              Operations.
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl mx-auto leading-relaxed">
              Explore the live dashboard populated with workforce records, active contracts, attendance logs, and sample payruns.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={ROUTES.DASHBOARD}
                className="apple-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold text-stone-950 bg-white hover:bg-stone-100 rounded-full shadow-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Open Live Platform</span>
                <ArrowRight className="w-4 h-4 text-stone-950" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white pt-14 pb-10 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-200/80">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">P360</div>
                <span className="font-heading font-extrabold text-lg text-stone-900 tracking-tight">PeoplePay360</span>
              </div>
              <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                Integrated HR, shift attendance, contract management, and automated multi-tier payroll calculation.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Status: Operational</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-anton font-bold text-stone-900 uppercase tracking-wider text-xs">Workspace Navigation</h4>
              <ul className="space-y-2 text-stone-600">
                <li><Link href={ROUTES.DASHBOARD} className="hover:text-stone-900 transition-colors">Executive Dashboard</Link></li>
                <li><Link href={ROUTES.EMPLOYEES.LIST} className="hover:text-stone-900 transition-colors">Employee Directory</Link></li>
                <li><Link href={ROUTES.CONTRACTS.LIST} className="hover:text-stone-900 transition-colors">Contract History</Link></li>
                <li><Link href={ROUTES.ATTENDANCE} className="hover:text-stone-900 transition-colors">Biometric Shift Attendance</Link></li>
                <li><Link href={ROUTES.PAYROLL.PAYRUNS} className="hover:text-stone-900 transition-colors">Payroll Runs &amp; Payslips</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-anton font-bold text-stone-900 uppercase tracking-wider text-xs">Core Architecture</h4>
              <ul className="space-y-2 text-stone-600">
                <li><a href="#horizontal-modules" className="hover:text-stone-900 transition-colors">PostgreSQL GiST Protection</a></li>
                <li><a href="#demo" className="hover:text-stone-900 transition-colors">Zero-Float BigDecimal Math</a></li>
                <li><a href="#demo" className="hover:text-stone-900 transition-colors">2-Step Payrun Scanner</a></li>
                <li><a href="#roles" className="hover:text-stone-900 transition-colors">5-Role Security Matrix</a></li>
                <li><a href="#horizontal-modules" className="hover:text-stone-900 transition-colors">PDF &amp; Email Queue</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-anton font-bold text-stone-900 uppercase tracking-wider text-xs">Legal &amp; Governance</h4>
              <ul className="space-y-2 text-stone-600">
                <li>
                  <Link href={ROUTES.LEGAL.PRIVACY} className="hover:text-stone-900 transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.LEGAL.TERMS} className="hover:text-stone-900 transition-colors flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-teal-600" />
                    <span>Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.LEGAL.SECURITY} className="hover:text-stone-900 transition-colors flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Security &amp; Cryptography</span>
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.LEGAL.COOKIES} className="hover:text-stone-900 transition-colors flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>Cookie Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <div>&copy; 2026 PeoplePay360 Inc. All rights reserved.</div>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-stone-400">Environment: Production</span>
              <span className="text-stone-400">Zero-Emoji Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
