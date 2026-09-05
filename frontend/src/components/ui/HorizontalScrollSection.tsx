"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export interface HorizontalScrollCardItem {
  id: string | number;
  badge?: string;
  title: string;
  subtitle: string;
  description: string;
  metrics?: { label: string; value: string }[];
  codeSnippet?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

interface HorizontalScrollSectionProps {
  title: string;
  subtitle: string;
  items: HorizontalScrollCardItem[];
}

export function HorizontalScrollSection({
  title,
  subtitle,
  items,
}: HorizontalScrollSectionProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current || !trackRef.current) return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const totalScrollableDistance = targetRect.height - viewportHeight;
      if (totalScrollableDistance <= 0) return;

      const currentScroll = -targetRect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollableDistance));

      setScrollProgress(progress);

      const trackWidth = trackRef.current.scrollWidth;
      const visibleWidth = trackRef.current.parentElement?.clientWidth || window.innerWidth;
      const maxTranslatePixels = Math.max(0, trackWidth - visibleWidth + 96);

      setTranslateX(progress * maxTranslatePixels);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [items.length]);

  return (
    <section ref={targetRef} className="relative h-[280vh] bg-[#f8fafc] text-stone-900 border-y border-stone-200 font-oswald">
      {/* Sticky Fullscreen Container */}
      <div className="sticky top-0 h-screen flex flex-col justify-between py-8 sm:py-12 overflow-hidden z-10">
        {/* Header Title & Section Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wider text-stone-900 font-anton">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{subtitle}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs font-mono font-bold text-teal-700">
              {Math.round(scrollProgress * 100)}% EXPLORED
            </div>
            <div className="w-36 h-2 rounded-full bg-stone-200 border border-stone-300 overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-75"
                style={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal Sliding Track */}
        <div className="w-full overflow-hidden my-auto py-4">
          <div
            ref={trackRef}
            className="flex items-stretch gap-6 px-4 sm:px-8 lg:px-12 transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: `translateX(-${translateX}px)` }}
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="w-[320px] sm:w-[420px] shrink-0 rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md flex flex-col justify-between space-y-6 group hover:border-teal-500/40 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon, Title & Index */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200 group-hover:scale-105 transition-transform">
                          <Icon className="w-5.5 h-5.5" strokeWidth={1.75} />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-stone-900 font-heading group-hover:text-teal-700 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-teal-700 font-medium">{item.subtitle}</p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-stone-400 shrink-0">
                        0{index + 1} / 0{items.length}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>

                    {/* Optional Metrics */}
                    {item.metrics && item.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        {item.metrics.map((m, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                            <div className="text-[10px] text-stone-500">{m.label}</div>
                            <div className="font-bold text-stone-900 mt-0.5 font-mono">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Optional Code Snippet */}
                    {item.codeSnippet && (
                      <div className="p-3 rounded-xl bg-stone-900 font-mono text-[11px] text-teal-300 overflow-x-auto">
                        <div className="text-[10px] text-stone-400 font-sans mb-1 font-bold">Rule Logic</div>
                        <code>{item.codeSnippet}</code>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-xs font-bold text-teal-700 group-hover:text-teal-800">
                    <span>Verified Operational Module</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </div>
                </div>
              );
            })}

            {/* End Callout Card inside track */}
            <div className="w-[300px] shrink-0 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-stone-50 p-7 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                P360
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading">Ready to test the live platform?</h3>
              <p className="text-xs text-stone-600">Jump directly into the live workspace and run payroll test cycles.</p>
              <Link
                href={ROUTES.DASHBOARD}
                className="w-full py-3 px-4 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Scroll Prompt */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span>Scroll down to continue vertical flow</span>
          <span className="font-mono text-teal-700">Horizontal Scroll Sync Active</span>
        </div>
      </div>
    </section>
  );
}
