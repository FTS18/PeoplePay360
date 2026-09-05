"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { ROUTES } from "@/config/routes";

const ROUTE_PERMISSIONS: { prefix: string; roles: Role[]; title: string }[] = [
  { prefix: "/payroll", roles: ["ADMIN", "HR_PAYROLL_MANAGER", "HR_PAYROLL_USER"], title: "Payroll Operations" },
  { prefix: "/employees", roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"], title: "Employee Directory & Records" },
  { prefix: "/contracts", roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"], title: "Contract Administration" },
  { prefix: "/schedules", roles: ["ADMIN", "HR_MANAGER", "HR_PAYROLL_MANAGER"], title: "Working Schedule Configuration" },
  { prefix: "/users", roles: ["ADMIN"], title: "User Access Administration" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useAuth();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("[PWA Engine] Service worker registered successfully:", reg.scope))
        .catch((err) => console.warn("[PWA Engine] Service worker registration failed:", err));
    }
  }, []);

  const matchedGuard = ROUTE_PERMISSIONS.find((guard) => pathname.startsWith(guard.prefix));
  const isDenied = Boolean(mounted && matchedGuard && !matchedGuard.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-150">
      {/* Fixed Full-Height Dark Vertical Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {isDenied && matchedGuard ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card border border-border rounded-2xl shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-4 border border-amber-500/20">
                <ShieldAlert className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Access Restricted (HTTP 403)
              </h2>
              <p className="mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
                You are attempting to access <strong className="font-semibold text-foreground">{matchedGuard.title}</strong>, which requires elevated operational privileges. Your current persona (Role: {role.replace(/_/g, " ")}) is unauthorized to view this section.
              </p>
              <div className="mt-5">
                <Link
                  href={ROUTES.DASHBOARD}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[oklch(28%_0.06_195)] text-white hover:bg-[oklch(24%_0.06_195)] transition-colors shadow-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
