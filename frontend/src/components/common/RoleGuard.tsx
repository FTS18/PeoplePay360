"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { ROUTES } from "@/config/routes";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  pageName?: string;
}

export function RoleGuard({ allowedRoles, children, pageName = "this page" }: RoleGuardProps) {
  const { role } = useAuth();

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/20 bg-card/80 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/30">
          <ShieldAlert className="h-8 w-8" strokeWidth={1.5} />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
            <Lock className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-brand">
            Access Restricted (403)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your current account persona (<span className="font-bold text-foreground">{role.replace(/_/g, " ")}</span>) is not authorized to access {pageName}.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/20 apple-press cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
