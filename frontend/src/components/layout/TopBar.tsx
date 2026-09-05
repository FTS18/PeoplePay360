"use client";

import React from "react";
import { Menu, Sun, Moon, Sparkles, LogOut, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { startTour } = useOnboardingTour();
  const { isOnline, isSyncing, pendingCount, triggerManualSync } = useNetworkStatus();

  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.firstName?.[0] || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 apple-glass px-4 sm:px-6 md:px-8 transition-all">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          className="apple-press rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card p-2 text-foreground hover:bg-muted md:hidden transition-colors shadow-2xs shrink-0"
        >
          <Menu className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div className="min-w-0">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Tour Button */}
        <button
          onClick={startTour}
          aria-label="Start interactive product tour"
          title="Interactive Product Tour"
          className="apple-press flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card text-foreground hover:bg-muted text-xs font-medium transition-all shadow-apple-sm cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
          <span className="hidden sm:inline">Quick Tour</span>
        </button>

        {/* Dynamic Network / Offline / Sync Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-stone-300/70 dark:border-stone-700/70 bg-stone-100/80 dark:bg-stone-800/80 px-3.5 py-1 text-xs shadow-2xs">
          {!isOnline ? (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.75} />
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Offline Mode {pendingCount > 0 ? `(${pendingCount} pending)` : ""}
              </span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-teal-500 animate-spin" strokeWidth={1.75} />
              <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                Syncing...
              </span>
            </>
          ) : pendingCount > 0 ? (
            <button
              onClick={() => triggerManualSync()}
              title="Click to synchronize queued offline actions"
              className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5 text-teal-500" strokeWidth={1.75} />
              <span>Sync {pendingCount} Pending Action{pendingCount > 1 ? "s" : ""}</span>
            </button>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[11px] font-medium text-muted-foreground">
                System Live
              </span>
            </>
          )}
        </div>

        {/* Dark / Light Theme Toggle Button */}
        <button
          id="topbar-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="apple-press flex h-8.5 w-8.5 items-center justify-center rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card text-foreground shadow-apple-sm hover:bg-muted transition-all cursor-pointer"
          suppressHydrationWarning
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 scale-100" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200 rotate-0 scale-100" strokeWidth={1.5} />
          )}
        </button>

        {/* User Identity / Role Badge */}
        <div id="topbar-role-badge" className="flex items-center gap-2.5 rounded-full border border-stone-300/80 dark:border-stone-700/80 bg-card pl-1.5 pr-3.5 py-1 shadow-apple-sm" suppressHydrationWarning>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/20 text-xs font-bold" suppressHydrationWarning>
            {userInitials}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-foreground leading-tight" suppressHydrationWarning>
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground" suppressHydrationWarning>
              {role.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Red Sign Out Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="apple-press flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all shadow-apple-sm cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 text-red-500" strokeWidth={1.75} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

