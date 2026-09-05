"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { AuroraBackground } from "@/components/ui/AuroraBackground";

export function LandingHero() {
  return (
    <AuroraBackground id="overview" className="pt-14 pb-16 sm:pt-20 sm:pb-24 border-b border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-stone-900 font-anton leading-[1.12] max-w-3xl mx-auto">
          Enterprise HR &amp; Payroll,{" "}
          <span className="font-serif italic font-normal text-teal-700 capitalize tracking-normal text-3xl sm:text-5xl lg:text-6xl">
            Built for Real Operations.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Manage employee profiles, contracts, shift attendance, leave balances, and monthly payroll in one clean platform — no spreadsheets required.
        </p>

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

        <div className="pt-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200/80 rounded-2xl border border-stone-200/80 bg-white/80 backdrop-blur-sm shadow-2xs p-2 text-left">
            {[
              { num: "01", title: "Contract Overlap Guard", sub: "PostgreSQL date range exclusion" },
              { num: "02", title: "Exact Currency Math", sub: "Zero rounding errors with BigDecimal" },
              { num: "03", title: "Pre-Payroll Audit", sub: "Scans missing bank & attendance data" },
            ].map((item) => (
              <div key={item.num} className="p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100 font-mono text-xs font-bold">
                  {item.num}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-stone-900">{item.title}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}
