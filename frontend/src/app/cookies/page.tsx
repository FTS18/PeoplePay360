"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/config/routes";

export default function CookiePolicyPage() {
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
            <Cookie className="w-3.5 h-3.5 text-teal-600" />
            <span>Session &amp; Preference Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 font-heading">
            Cookie Policy &amp; Storage Preferences
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Last Updated: September 6, 2026 • Strict Minimal Tracking Guarantee
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">1. How We Use Cookies</h2>
            <p>
              PeoplePay360 uses strictly necessary session cookies and local browser storage to maintain secure user authentication state, persist active JWT bearer tokens, and remember UI theme preferences (Light / Dark mode).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">2. Cookie Categories</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-1">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>Essential Authentication Cookies</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 font-bold border border-teal-200">Strictly Mandatory</span>
                </div>
                <p className="text-stone-600">Maintains secure authenticated session state across API requests. Cannot be disabled without breaking application functionality.</p>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-1">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>UI Preference Storage (`pp360-theme`)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700 font-bold">Functional</span>
                </div>
                <p className="text-stone-600">Stores user theme selection (`light` or `dark`) in `localStorage` to ensure instant flash-free rendering.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-stone-900 font-heading">3. Zero Third-Party Tracker Guarantee</h2>
            <p>
              PeoplePay360 contains <strong>zero third-party advertising trackers, cross-site tracking cookies, or commercial data brokers</strong>. All analytics are aggregated anonymously directly on internal database server metrics.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>&copy; 2026 PeoplePay360 Inc. All rights reserved.</span>
          <Link href={ROUTES.LEGAL.PRIVACY} className="text-teal-700 hover:underline font-semibold">
            View Privacy Policy $\rightarrow$
          </Link>
        </div>
      </footer>
    </div>
  );
}
