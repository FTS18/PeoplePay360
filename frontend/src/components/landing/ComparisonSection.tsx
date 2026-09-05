"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

const PROBLEMS = [
  { title: "Fragmented Spreadsheets:", body: "HR records, attendance, and leave balance sheets live in separate files." },
  { title: "Outdated Contract Terms:", body: "Wage revisions or contract changes are easily missed during payrun calculations." },
  { title: "Unchecked Shift Hours:", body: "Missing check-outs and unverified hours slip directly into salary totals." },
  { title: "Rushed Payrun Locks:", body: "Payroll is finalized without checking for missing bank accounts or duplicate payslips." },
];

const SOLUTIONS = [
  { title: "Single Operational Source:", body: "Employee records connect directly to active contracts, shift logs, and leave balances." },
  { title: "Active Period Resolution:", body: "Automatically resolves only the contract valid during the targeted payrun dates." },
  { title: "Audited Shift Attendance:", body: "Captures clock timestamps with anomaly flags and mandatory manager audit reasons." },
  { title: "Pre-Flight Warning Audit:", body: "Scans payruns for unlinked bank details or missing records before final lock." },
];

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-20 sm:py-24 bg-stone-900 text-white border-y border-stone-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-anton">
            Solving Real{" "}
            <span className="font-serif italic font-normal text-teal-300 capitalize tracking-normal text-3xl sm:text-5xl">
              Payroll &amp; HR Bottlenecks
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-medium">
            Traditional spreadsheets and disconnected tools create payroll errors. Here is how PeoplePay360 fixes them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-rose-900/60 bg-rose-950/40 space-y-4 text-rose-100">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" strokeWidth={2} />
              <span>Common Payroll &amp; HR Problems</span>
            </div>
            <ul className="space-y-3 text-xs text-rose-200/80">
              {PROBLEMS.map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>{item.title}</strong> {item.body}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-teal-800/80 bg-[#062420] space-y-4 text-teal-100 shadow-xl">
            <div className="flex items-center gap-2.5 text-teal-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-teal-400" strokeWidth={2} />
              <span>How PeoplePay360 Solves It</span>
            </div>
            <ul className="space-y-3 text-xs text-teal-100/90">
              {SOLUTIONS.map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span><strong>{item.title}</strong> {item.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
