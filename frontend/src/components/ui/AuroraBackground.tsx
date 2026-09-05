"use client";

import React from "react";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  children,
  className = "",
  id,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      id={id}
      className={`relative flex flex-col items-center justify-center bg-[#fafafa] text-stone-900 transition-colors ${className}`}
    >
      {/* ─── White Aurora Ambient Background ────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Teal / Mint Radial Blobs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-gradient-to-b from-teal-200/40 via-teal-100/25 to-transparent blur-[100px] animate-aurora" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-200/30 blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-teal-300/20 blur-[140px] animate-pulse duration-[10000ms]" />

        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#0f766e 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {showRadialGradient && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fafafa]/50 to-[#fafafa]" />
        )}
      </div>

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
