"use client";

import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const { user, role } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[oklch(92%_0.005_240)] bg-[oklch(97%_0.005_240)]/90 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="rounded-lg border border-[oklch(90%_0.01_240)] bg-white p-1.5 text-[oklch(40%_0.02_240)] hover:text-[oklch(20%_0.02_240)] md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[oklch(92%_0.005_240)] bg-white px-3 py-1 shadow-xs">
          <span className="h-2 w-2 rounded-full bg-[oklch(75%_0.16_150)] animate-pulse" />
          <span className="text-[11px] font-medium text-[oklch(40%_0.02_240)]">
            System Live
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[oklch(40%_0.02_240)]">
          <span className="font-medium text-[oklch(20%_0.02_240)]">{user?.firstName}</span>
          <span className="rounded bg-[oklch(92%_0.01_240)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
            {role.replace(/_/g, " ")}
          </span>
        </div>
      </div>
    </header>
  );
}
