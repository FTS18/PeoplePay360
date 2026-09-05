"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Calendar,
  CreditCard,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
  Users,
  AlertCircle,
  Play,
  ChevronRight,
  Lock,
  Scale,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { HorizontalScrollSection, HorizontalScrollCardItem } from "@/components/ui/HorizontalScrollSection";

export default function LandingPage() {
  const [activeDemoTab, setActiveDemoTab] = useState<
    "PUNCH" | "CONTRACT" | "SALARY" | "PAYRUN" | "ANALYTICS"
  >("PUNCH");

  const [activeRoleTab, setActiveRoleTab] = useState<
    "EMPLOYEE" | "HR_MANAGER" | "PAYROLL_USER" | "PAYROLL_MANAGER" | "ADMIN"
  >("PAYROLL_MANAGER");

  // Scroll direction header visibility state (Show header ONLY when scrolling up or at top)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 20) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling DOWN -> Hide Header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP -> Show Header
        setIsHeaderVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const horizontalModules: HorizontalScrollCardItem[] = [
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

  return (
    <div className="landing-page min-h-screen bg-[#fafafa] text-stone-900 font-oswald antialiased selection:bg-teal-500/20 selection:text-teal-900 overflow-x-clip">
      {/* ─── Top Navigation Header (Auto-Hides on Scroll Down, Shows ONLY on Scroll Up) ─── */}
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
              <span className="font-heading font-extrabold text-base tracking-tight text-stone-900">
                PeoplePay360
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
              <a href="#overview" className="hover:text-stone-900 transition-colors">
                Overview
              </a>
              <a href="#demo" className="hover:text-stone-900 transition-colors">
                Playground
              </a>
              <a href="#horizontal-modules" className="hover:text-stone-900 transition-colors">
                Features
              </a>
              <a href="#comparison" className="hover:text-stone-900 transition-colors">
                Comparison
              </a>
              <a href="#roles" className="hover:text-stone-900 transition-colors">
                Roles &amp; Access
              </a>
              <a href="#workflows" className="hover:text-stone-900 transition-colors">
                Workflows
              </a>
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

      {/* ─── Hero Section with White Aurora Background (LIGHT SECTION) ──── */}
      <AuroraBackground id="overview" className="pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Oswald / Anton Editorial Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-stone-900 font-anton leading-[1.12] max-w-3xl mx-auto">
            Enterprise HR &amp; Payroll, <span className="font-serif italic font-normal text-teal-700 capitalize tracking-normal text-3xl sm:text-5xl lg:text-6xl">Built for Real Operations.</span>
          </h1>

          {/* Clean Subtitle */}
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Manage employee profiles, contracts, shift attendance, leave balances, and monthly payroll in one clean platform — no spreadsheets required.
          </p>

          {/* Action CTAs (Properly Spaced & Sized) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href={ROUTES.DASHBOARD}
              className="apple-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-stone-900 hover:bg-black rounded-full shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <a
              href="#demo"
              className="apple-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100/80 border border-stone-200 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 text-teal-700" strokeWidth={2} />
              <span>Interactive Feature Playground</span>
            </a>
          </div>

          {/* Single-Container 3-Column Architecture Bar */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200/80 rounded-2xl border border-stone-200/80 bg-white/80 backdrop-blur-sm shadow-2xs p-2 text-left">
              <div className="p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 font-mono text-xs font-bold">
                  01
                </div>
                <div className="text-xs">
                  <div className="font-bold text-stone-900">Contract Overlap Guard</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">PostgreSQL date range exclusion</div>
                </div>
              </div>

              <div className="p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 font-mono text-xs font-bold">
                  02
                </div>
                <div className="text-xs">
                  <div className="font-bold text-stone-900">Exact Currency Math</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Zero rounding errors with BigDecimal</div>
                </div>
              </div>

              <div className="p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 font-mono text-xs font-bold">
                  03
                </div>
                <div className="text-xs">
                  <div className="font-bold text-stone-900">Pre-Payroll Audit</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Scans missing bank &amp; attendance data</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuroraBackground>

      {/* ─── ElevenLabs Interactive Playground (DARK TEAL ACCENT SECTION) ── */}
      <section id="demo" className="py-20 border-b border-teal-900/80 bg-[#071d1b] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-wider text-white font-anton">
              Interactive <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-2xl sm:text-4xl">Feature Playground</span>
            </h2>
            <p className="text-xs sm:text-sm text-teal-200/80 font-medium">
              Test how attendance, contracts, salary calculations, and payruns work in real time.
            </p>
          </div>

          {/* Option 1: Mobile Segmented Pill Switcher (Visible on Mobile only) */}
          <div className="flex md:hidden justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#041413] border border-teal-800/80 shadow-inner overflow-x-auto no-scrollbar max-w-full">
              {[
                { id: "PUNCH", label: "Biometrics", icon: Clock },
                { id: "CONTRACT", label: "Contracts", icon: FileText },
                { id: "SALARY", label: "Salary Engine", icon: Layers },
                { id: "PAYRUN", label: "Payrun Audit", icon: CreditCard },
                { id: "ANALYTICS", label: "Analytics", icon: BarChart3 },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeDemoTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemoTab(tab.id as any)}
                    className={`apple-press cursor-pointer px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-full transition-all whitespace-nowrap ${
                      active
                        ? "bg-teal-600 text-white font-bold shadow-md"
                        : "text-teal-200/70 hover:text-white hover:bg-teal-900/40"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-teal-400/70"}`} strokeWidth={2} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Layout: 2-Column Split Stepper on Desktop + Clean Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Option 2: Left 4-Column Vertical Stepper Menu (Desktop) */}
            <div className="hidden md:flex md:col-span-4 flex-col gap-2.5 p-3 rounded-3xl bg-[#041413] border border-teal-800/80 shadow-inner">
              {[
                { id: "PUNCH", num: "01", label: "Biometrics", desc: "Shift punch & audit logs", icon: Clock },
                { id: "CONTRACT", num: "02", label: "Contracts", desc: "PostgreSQL GiST range guard", icon: FileText },
                { id: "SALARY", num: "03", label: "Salary Engine", desc: "Sequential rule calculation", icon: Layers },
                { id: "PAYRUN", num: "04", label: "Payrun Audit", desc: "2-step warning scanner", icon: CreditCard },
                { id: "ANALYTICS", num: "05", label: "Analytics", desc: "Real-time cost aggregates", icon: BarChart3 },
              ].map((step) => {
                const Icon = step.icon;
                const active = activeDemoTab === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveDemoTab(step.id as any)}
                    className={`apple-press cursor-pointer p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 border ${
                      active
                        ? "bg-[#0d2a27] border-teal-500/80 text-white shadow-lg ring-1 ring-teal-500/30"
                        : "border-transparent text-teal-300/60 hover:text-teal-100 hover:bg-teal-950/40"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      active ? "bg-teal-600 text-white" : "bg-teal-950 text-teal-400 border border-teal-800/60"
                    }`}>
                      {step.num}
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{step.label}</span>
                      </div>
                      <div className="text-[11px] text-teal-200/60 mt-0.5 leading-tight">{step.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Preview Card (Right 8 Columns on Desktop) */}
            <div className="md:col-span-8 rounded-3xl p-6 sm:p-8 border border-teal-800/80 bg-[#0d2a27] text-teal-50 shadow-2xl min-h-[280px]">
              {/* Option 3: Clean Floating Text Header & Glow Pill Badges */}
              {activeDemoTab === "PUNCH" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                    <div>
                      <h3 className="text-sm font-bold text-white">Biometric Punch Clock &amp; Shift Compliance</h3>
                      <p className="text-xs text-teal-200/70 mt-0.5">Captures employee attendance with 8h shift basis and audit overrides</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                      STATUS: ON DUTY
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70 font-medium">Punch Timestamp</span>
                      <div className="font-bold text-white mt-1 tabular-nums text-sm">09:00:15 AM</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70 font-medium">Assigned Schedule</span>
                      <div className="font-bold text-white mt-1">Standard 40h (Mon-Fri)</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70 font-medium">Supervisor Audit Trail</span>
                      <div className="font-bold text-teal-300 mt-1">Verified Override</div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "CONTRACT" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                    <div>
                      <h3 className="text-sm font-bold text-white">Temporal Period-Specific Contract Matching</h3>
                      <p className="text-xs text-teal-200/70 mt-0.5">Payroll resolves only the active contract for the target payrun period</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      POSTGRES GIST ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-4 rounded-2xl border border-teal-700 bg-teal-900/40 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Active Pay Period Contract</span>
                        <span className="text-[10px] font-mono text-teal-300">CNT-2026-881</span>
                      </div>
                      <p className="text-xs text-teal-200 leading-relaxed">Valid: Sep 1, 2026 — Dec 31, 2026 • Monthly Wage: ₹65,000.00</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-teal-900 bg-[#071d1b] opacity-60 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-teal-300/60">
                        <span>Historical Contract</span>
                        <span className="text-[10px] font-mono">CNT-2025-412</span>
                      </div>
                      <p className="text-xs text-teal-300/50 leading-relaxed">Expired: Aug 31, 2026 • Automatically Excluded from Payrun</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "SALARY" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                    <div>
                      <h3 className="text-sm font-bold text-white">Sequential Rule Computation Pipeline</h3>
                      <p className="text-xs text-teal-200/70 mt-0.5">Executes rules in strict sequence (10, 20, 30...) to derive final net pay</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                      STRUCTURE: REGULAR SALARY
                    </span>
                  </div>
                  <div className="border border-teal-800/60 rounded-2xl overflow-hidden text-xs">
                    <div className="grid grid-cols-4 p-2.5 bg-[#071d1b] font-semibold text-teal-300/70 border-b border-teal-800/60 text-[11px] uppercase tracking-wider">
                      <span>Seq</span>
                      <span>Rule</span>
                      <span>Category</span>
                      <span className="text-right">Computed Amount</span>
                    </div>
                    <div className="divide-y divide-teal-900/60 bg-[#0a2321]">
                      <div className="grid grid-cols-4 p-2.5 font-medium">
                        <span className="font-mono text-teal-400/80">10</span>
                        <span className="font-bold text-white">Basic Salary</span>
                        <span className="text-teal-300/70">BASIC</span>
                        <span className="text-right font-bold tabular-nums text-white">₹50,000.00</span>
                      </div>
                      <div className="grid grid-cols-4 p-2.5 font-medium">
                        <span className="font-mono text-teal-400/80">20</span>
                        <span className="font-bold text-white">House Rent Allowance (HRA)</span>
                        <span className="text-teal-300/70">ALLOWANCE</span>
                        <span className="text-right font-bold tabular-nums text-white">₹20,000.00</span>
                      </div>
                      <div className="grid grid-cols-4 p-2.5 font-medium">
                        <span className="font-mono text-teal-400/80">30</span>
                        <span className="font-bold text-white">Provident Fund (PF)</span>
                        <span className="text-teal-300/70">DEDUCTION</span>
                        <span className="text-right font-bold text-rose-400 tabular-nums">-₹6,000.00</span>
                      </div>
                      <div className="grid grid-cols-4 p-2.5 font-medium bg-teal-900/60">
                        <span className="font-mono text-teal-300">100</span>
                        <span className="font-bold text-white">Final Net Salary</span>
                        <span className="text-teal-300 font-bold">NET</span>
                        <span className="text-right font-extrabold text-teal-300 tabular-nums">₹64,000.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "PAYRUN" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                    <div>
                      <h3 className="text-sm font-bold text-white">2-Step Payrun Wizard with Audit Scanner</h3>
                      <p className="text-xs text-teal-200/70 mt-0.5">Surfaces operational warnings before final validation &amp; payment</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      AUDIT ALERTS ACTIVE
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl border border-amber-800/80 bg-amber-950/40 flex items-start gap-3 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <span className="font-bold text-amber-200">Pre-Payroll Warning Scanned:</span>
                      <p className="text-amber-300/90 mt-1 leading-relaxed">
                        Employee EMP182 (Kavita Sharma) is missing bank account number. Payrun validation requires bank details.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "ANALYTICS" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                    <div>
                      <h3 className="text-sm font-bold text-white">Real-Time Executive Analytics</h3>
                      <p className="text-xs text-teal-200/70 mt-0.5">Aggregates live database metrics across departments and payroll periods</p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
                      LIVE FEED ACTIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3.5 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70">Total Disbursed</span>
                      <div className="text-base font-extrabold text-white mt-1 tabular-nums">₹14.8M</div>
                    </div>
                    <div className="p-3.5 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70">Active Staff</span>
                      <div className="text-base font-extrabold text-white mt-1 tabular-nums">180</div>
                    </div>
                    <div className="p-3.5 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70">Attendance Health</span>
                      <div className="text-base font-extrabold text-teal-300 mt-1 tabular-nums">98.4%</div>
                    </div>
                    <div className="p-3.5 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70">Approved Leaves</span>
                      <div className="text-base font-extrabold text-white mt-1 tabular-nums">42 Days</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Horizontal Scroll Section (LIGHT SLATE CANVAS) ─────────────── */}
      <div id="horizontal-modules" className="bg-[#f8fafc]">
        <HorizontalScrollSection
          title="Core Platform Features"
          subtitle="Scroll through the operational modules powering PeoplePay360."
          items={horizontalModules}
        />
      </div>

      {/* ─── Problem vs. Solution (DEEP CHARCOAL SECTION) ─────────────── */}
      <section id="comparison" className="py-20 sm:py-24 bg-stone-900 text-white border-y border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-anton">
              Solving Real <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-3xl sm:text-5xl">Payroll &amp; HR Bottlenecks</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 font-medium">
              Traditional spreadsheets and disconnected tools create payroll errors. Here is how PeoplePay360 fixes them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Siloed Legacy Approach */}
            <div className="p-6 sm:p-8 rounded-3xl border border-rose-900/60 bg-rose-950/40 space-y-4 text-rose-100">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5" strokeWidth={2} />
                <span>Common Payroll &amp; HR Problems</span>
              </div>
              <ul className="space-y-3 text-xs text-rose-200/80">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Fragmented Spreadsheets:</strong> HR records, attendance, and leave balance sheets live in separate files.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Outdated Contract Terms:</strong> Wage revisions or contract changes are easily missed during payrun calculations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Unchecked Shift Hours:</strong> Missing check-outs and unverified hours slip directly into salary totals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Rushed Payrun Locks:</strong> Payroll is finalized without checking for missing bank accounts or duplicate payslips.</span>
                </li>
              </ul>
            </div>

            {/* PeoplePay360 Connected Flow */}
            <div className="p-6 sm:p-8 rounded-3xl border border-teal-800/80 bg-[#062420] space-y-4 text-teal-100 shadow-xl">
              <div className="flex items-center gap-2.5 text-teal-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-teal-400" strokeWidth={2} />
                <span>How PeoplePay360 Solves It</span>
              </div>
              <ul className="space-y-3 text-xs text-teal-100/90">
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>Single Operational Source:</strong> Employee records connect directly to active contracts, shift logs, and leave balances.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>Active Period Resolution:</strong> Automatically resolves only the contract valid during the targeted payrun dates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>Audited Shift Attendance:</strong> Captures clock timestamps with anomaly flags and mandatory manager audit reasons.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>Pre-Flight Warning Audit:</strong> Scans payruns for unlinked bank details or missing records before final lock.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Role-Based Security Matrix (CRISP WHITE SECTION) ───────────── */}
      <section id="roles" className="py-20 sm:py-24 bg-white text-stone-900 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-stone-900 font-anton">
              Role-Based <span className="font-serif italic font-normal text-teal-700 capitalize tracking-normal text-3xl sm:text-5xl">Access Control</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Enforces clear permission boundaries across employees, HR managers, payroll specialists, and admins.
            </p>
          </div>

          <div className="rounded-3xl p-6 sm:p-8 border border-stone-200/80 bg-stone-50/50 shadow-2xs">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { id: "EMPLOYEE", label: "Employee" },
                { id: "HR_MANAGER", label: "HR Manager" },
                { id: "PAYROLL_USER", label: "HR Payroll User" },
                { id: "PAYROLL_MANAGER", label: "HR Payroll Manager" },
                { id: "ADMIN", label: "Admin" },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRoleTab(role.id as any)}
                  className={`apple-press px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                    activeRoleTab === role.id
                      ? "bg-stone-900 text-white shadow-2xs font-bold"
                      : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <div className="text-xs space-y-4 max-w-2xl mx-auto text-center">
              {activeRoleTab === "EMPLOYEE" && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="font-bold text-sm text-stone-900">Standard Employee Access</div>
                  <p className="text-stone-600">
                    Can view personal profile details, punch shift attendance, apply for leave, and download personal payslip PDFs. Zero access to administrative or payroll controls.
                  </p>
                </div>
              )}

              {activeRoleTab === "HR_MANAGER" && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="font-bold text-sm text-stone-900">HR Manager Operations</div>
                  <p className="text-stone-600">
                    Full management of Employees, Contracts, Schedules, and Time-Off approvals. Restricted from computing or validating payruns.
                  </p>
                </div>
              )}

              {activeRoleTab === "PAYROLL_USER" && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="font-bold text-sm text-stone-900">HR Payroll User</div>
                  <p className="text-stone-600">
                    All HR Manager permissions plus Create/Read/Update access to draft Payruns and Payslips. Read-only inspection of Salary Structures and Rules.
                  </p>
                </div>
              )}

              {activeRoleTab === "PAYROLL_MANAGER" && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="font-bold text-sm text-stone-900">HR Payroll Manager</div>
                  <p className="text-stone-600">
                    Full control over Payruns, Payslips, Salary Structures, and Rules. Full authority to validate payruns, mark as paid, and trigger bulk email delivery.
                  </p>
                </div>
              )}

              {activeRoleTab === "ADMIN" && (
                <div className="space-y-2 animate-in fade-in">
                  <div className="font-bold text-sm text-stone-900">Full Platform Administrator</div>
                  <p className="text-stone-600">
                    Unrestricted access to all modules, system configurations, user role assignments, permission overrides, and platform audit logs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── End-to-End Walkthrough Scenarios (DARK TEAL ACCENT SECTION) ── */}
      <section id="workflows" className="py-20 bg-[#071d1b] text-white border-b border-teal-900/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-anton">
              End-to-End <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-3xl sm:text-5xl">Operational Workflows</span>
            </h2>
            <p className="text-xs sm:text-sm text-teal-200/80 font-medium">
              See how employee records flow from onboarding to payslip delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-teal-800/80 bg-[#0d2a27] shadow-xl space-y-4">
              <div className="font-bold text-sm text-teal-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center text-xs border border-teal-700 font-mono">1</span>
                <span>Scenario A: Onboarding to Payslip Delivery</span>
              </div>
              <div className="text-xs text-teal-100/80 space-y-2 font-mono leading-relaxed">
                <div>1. Employee profile created &amp; shift schedule assigned</div>
                <div>2. Active employment contract registered with wage</div>
                <div>3. Shift punch records logged via attendance terminal</div>
                <div>4. Payrun initialized for the target pay period</div>
                <div>5. Pre-payroll warning scanner checks missing data</div>
                <div>6. Salary rules calculate gross and net pay</div>
                <div>7. Payrun finalized, payslip PDF generated &amp; emailed</div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl border border-teal-800/80 bg-[#0d2a27] shadow-xl space-y-4">
              <div className="font-bold text-sm text-teal-300 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-900/80 text-teal-300 flex items-center justify-center text-xs border border-teal-700 font-mono">2</span>
                <span>Scenario B: Leave Request &amp; Balance Deduction</span>
              </div>
              <div className="text-xs text-teal-100/80 space-y-2 font-mono leading-relaxed">
                <div>1. Leave policy configured (Days or Hours)</div>
                <div>2. Annual leave quota allocated to employee</div>
                <div>3. Employee submits leave application</div>
                <div>4. Overlap &amp; balance availability check runs</div>
                <div>5. Manager approves leave request</div>
                <div>6. Leave quota balance automatically debited</div>
                <div>7. Work entry reflected on final payslip</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom Call-to-Action Card ─────────── */}
      <section className="py-20 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl border border-teal-900/80 bg-gradient-to-br from-[#062420] via-stone-900 to-[#0a3530] p-8 sm:p-14 text-center space-y-6 shadow-2xl overflow-hidden text-white">
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-wide text-white font-anton max-w-2xl mx-auto">
              Streamline Your <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-4xl sm:text-6xl">HR &amp; Payroll</span> Operations.
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

      {/* ─── Multi-Column Enterprise Footer ────────── */}
      <footer className="border-t border-stone-200 bg-white pt-14 pb-10 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Row: Brand & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-10 border-b border-stone-200/80">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  P360
                </div>
                <span className="font-heading font-extrabold text-lg text-stone-900 tracking-tight">
                  PeoplePay360
                </span>
              </div>
              <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                Integrated HR, shift attendance, contract management, and automated multi-tier payroll calculation.
              </p>

              {/* System Live Operational Status Line */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Status: Operational</span>
              </div>
            </div>

            {/* Column 1: Platform Navigation */}
            <div className="space-y-3">
              <h4 className="font-anton font-bold text-stone-900 uppercase tracking-wider text-xs">Workspace Navigation</h4>
              <ul className="space-y-2 text-stone-600">
                <li>
                  <Link href={ROUTES.DASHBOARD} className="hover:text-stone-900 transition-colors">
                    Executive Dashboard
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.EMPLOYEES.LIST} className="hover:text-stone-900 transition-colors">
                    Employee Directory
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.CONTRACTS.LIST} className="hover:text-stone-900 transition-colors">
                    Contract History
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.ATTENDANCE} className="hover:text-stone-900 transition-colors">
                    Biometric Shift Attendance
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.PAYROLL.PAYRUNS} className="hover:text-stone-900 transition-colors">
                    Payroll Runs &amp; Payslips
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Architecture & Capabilities */}
            <div className="space-y-3">
              <h4 className="font-anton font-bold text-stone-900 uppercase tracking-wider text-xs">Core Architecture</h4>
              <ul className="space-y-2 text-stone-600">
                <li>
                  <a href="#horizontal-modules" className="hover:text-stone-900 transition-colors">
                    PostgreSQL GiST Protection
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-stone-900 transition-colors">
                    Zero-Float BigDecimal Math
                  </a>
                </li>
                <li>
                  <a href="#demo" className="hover:text-stone-900 transition-colors">
                    2-Step Payrun Scanner
                  </a>
                </li>
                <li>
                  <a href="#roles" className="hover:text-stone-900 transition-colors">
                    5-Role Security Matrix
                  </a>
                </li>
                <li>
                  <a href="#horizontal-modules" className="hover:text-stone-900 transition-colors">
                    PDF &amp; Email Queue
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Governance */}
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

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <div>
              &copy; 2026 PeoplePay360 Inc. All rights reserved.
            </div>
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
