"use client";

import { useState } from "react";
import { Clock, FileText, Layers, CreditCard, BarChart3, AlertCircle } from "lucide-react";

type DemoTab = "PUNCH" | "CONTRACT" | "SALARY" | "PAYRUN" | "ANALYTICS";

const STEPS = [
  { id: "PUNCH" as DemoTab, num: "01", label: "Biometrics", desc: "Shift punch & audit logs", icon: Clock },
  { id: "CONTRACT" as DemoTab, num: "02", label: "Contracts", desc: "PostgreSQL GiST range guard", icon: FileText },
  { id: "SALARY" as DemoTab, num: "03", label: "Salary Engine", desc: "Sequential rule calculation", icon: Layers },
  { id: "PAYRUN" as DemoTab, num: "04", label: "Payrun Audit", desc: "2-step warning scanner", icon: CreditCard },
  { id: "ANALYTICS" as DemoTab, num: "05", label: "Analytics", desc: "Real-time cost aggregates", icon: BarChart3 },
];

export function FeaturePlayground() {
  const [activeTab, setActiveTab] = useState<DemoTab>("PUNCH");

  return (
    <section id="demo" className="py-20 border-b border-teal-900/80 bg-[#071d1b] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-wider text-white font-anton">
            Interactive{" "}
            <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-2xl sm:text-4xl">
              Feature Playground
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-teal-200/80 font-medium">
            Test how attendance, contracts, salary calculations, and payruns work in real time.
          </p>
        </div>

        {/* Mobile pill switcher */}
        <div className="flex md:hidden justify-center">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[#041413] border border-teal-800/80 shadow-inner overflow-x-auto no-scrollbar max-w-full">
            {STEPS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`apple-press cursor-pointer px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-full transition-all whitespace-nowrap ${
                    active ? "bg-teal-600 text-white font-bold shadow-md" : "text-teal-200/70 hover:text-white hover:bg-teal-900/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-teal-400/70"}`} strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Desktop stepper */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-2.5 p-3 rounded-3xl bg-[#041413] border border-teal-800/80 shadow-inner">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const active = activeTab === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`apple-press cursor-pointer p-3.5 rounded-2xl text-left transition-all flex items-start gap-3 border ${
                    active
                      ? "bg-[#0d2a27] border-teal-500/80 text-white shadow-lg ring-1 ring-teal-500/30"
                      : "border-transparent text-teal-300/60 hover:text-teal-100 hover:bg-teal-950/40"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${active ? "bg-teal-600 text-white" : "bg-teal-950 text-teal-400 border border-teal-800/60"}`}>
                    {step.num}
                  </div>
                  <div>
                    <div className="font-bold text-xs">{step.label}</div>
                    <div className="text-[11px] text-teal-200/60 mt-0.5 leading-tight">{step.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview panel */}
          <div className="md:col-span-8 rounded-3xl p-6 sm:p-8 border border-teal-800/80 bg-[#0d2a27] text-teal-50 shadow-2xl min-h-[280px]">
            {activeTab === "PUNCH" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                  <div>
                    <h3 className="text-sm font-bold text-white">Biometric Punch Clock &amp; Shift Compliance</h3>
                    <p className="text-xs text-teal-200/70 mt-0.5">Captures employee attendance with 8h shift basis and audit overrides</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">STATUS: ON DUTY</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: "Punch Timestamp", value: "09:00:15 AM", accent: false },
                    { label: "Assigned Schedule", value: "Standard 40h (Mon-Fri)", accent: false },
                    { label: "Supervisor Audit Trail", value: "Verified Override", accent: true },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70 font-medium">{item.label}</span>
                      <div className={`font-bold mt-1 ${item.accent ? "text-teal-300" : "text-white"}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "CONTRACT" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                  <div>
                    <h3 className="text-sm font-bold text-white">Temporal Period-Specific Contract Matching</h3>
                    <p className="text-xs text-teal-200/70 mt-0.5">Payroll resolves only the active contract for the target payrun period</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">POSTGRES GIST ACTIVE</span>
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

            {activeTab === "SALARY" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                  <div>
                    <h3 className="text-sm font-bold text-white">Sequential Rule Computation Pipeline</h3>
                    <p className="text-xs text-teal-200/70 mt-0.5">Executes rules in strict sequence (10, 20, 30...) to derive final net pay</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">STRUCTURE: REGULAR SALARY</span>
                </div>
                <div className="border border-teal-800/60 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 p-2.5 bg-[#071d1b] font-semibold text-teal-300/70 border-b border-teal-800/60 text-[11px] uppercase tracking-wider">
                    <span>Seq</span><span>Rule</span><span>Category</span><span className="text-right">Computed Amount</span>
                  </div>
                  <div className="divide-y divide-teal-900/60 bg-[#0a2321]">
                    {[
                      { seq: "10", name: "Basic Salary", cat: "BASIC", amount: "₹50,000.00", net: false },
                      { seq: "20", name: "House Rent Allowance (HRA)", cat: "ALLOWANCE", amount: "₹20,000.00", net: false },
                      { seq: "30", name: "Provident Fund (PF)", cat: "DEDUCTION", amount: "-₹6,000.00", net: false },
                    ].map((row) => (
                      <div key={row.seq} className="grid grid-cols-4 p-2.5 font-medium">
                        <span className="font-mono text-teal-400/80">{row.seq}</span>
                        <span className="font-bold text-white">{row.name}</span>
                        <span className="text-teal-300/70">{row.cat}</span>
                        <span className={`text-right font-bold tabular-nums ${row.cat === "DEDUCTION" ? "text-rose-400" : "text-white"}`}>{row.amount}</span>
                      </div>
                    ))}
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

            {activeTab === "PAYRUN" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                  <div>
                    <h3 className="text-sm font-bold text-white">2-Step Payrun Wizard with Audit Scanner</h3>
                    <p className="text-xs text-teal-200/70 mt-0.5">Surfaces operational warnings before final validation &amp; payment</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">AUDIT ALERTS ACTIVE</span>
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

            {activeTab === "ANALYTICS" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-800/60">
                  <div>
                    <h3 className="text-sm font-bold text-white">Real-Time Executive Analytics</h3>
                    <p className="text-xs text-teal-200/70 mt-0.5">Aggregates live database metrics across departments and payroll periods</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">LIVE FEED ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  {[
                    { label: "Total Disbursed", value: "₹14.8M", accent: false },
                    { label: "Active Staff", value: "180", accent: false },
                    { label: "Attendance Health", value: "98.4%", accent: true },
                    { label: "Approved Leaves", value: "42 Days", accent: false },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3.5 rounded-2xl border border-teal-800/60 bg-[#071d1b]">
                      <span className="text-teal-300/70">{stat.label}</span>
                      <div className={`text-base font-extrabold mt-1 tabular-nums ${stat.accent ? "text-teal-300" : "text-white"}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
