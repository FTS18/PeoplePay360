"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useAuth();
  const [email, setEmail] = useState("michael.scott@dundermifflin.com");
  const [password, setPassword] = useState("••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleQuickRole = (role: Role, roleEmail: string) => {
    setEmail(roleEmail);
    switchRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-(--border) bg-(--card) p-8 shadow-xs">
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary) text-(--primary-foreground)">
            <CreditCard className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-(--foreground)">PeoplePay360</h1>
          <p className="text-xs text-(--muted-foreground)">
            Enterprise Human Resource & Payroll Operations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--foreground)">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-(--muted-foreground)" strokeWidth={1.5} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-9 pr-3 text-xs text-(--foreground) focus:border-(--primary) focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--foreground)">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-(--muted-foreground)" strokeWidth={1.5} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-(--border) bg-(--background) py-2 pl-9 pr-3 text-xs text-(--foreground) focus:border-(--primary) focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-(--primary) py-2.5 px-4 text-xs font-medium text-(--primary-foreground) hover:bg-(--primary)/90 shadow-xs transition-colors"
          >
            Sign In to Workspace
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </form>

        <div className="border-t border-(--border) pt-4 space-y-2">
          <p className="text-[11px] font-medium text-(--muted-foreground) text-center uppercase tracking-wider">
            Quick Persona Switcher
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                handleQuickRole("HR_PAYROLL_MANAGER", "michael.scott@dundermifflin.com")
              }
              className="p-2 rounded-lg border border-(--border) hover:bg-(--accent) text-[11px] font-medium text-left"
            >
              <div className="font-semibold text-(--foreground)">Payroll Manager</div>
              <div className="text-(--muted-foreground) truncate">Michael Scott</div>
            </button>
            <button
              onClick={() => handleQuickRole("HR_MANAGER", "dwight.schrute@dundermifflin.com")}
              className="p-2 rounded-lg border border-(--border) hover:bg-(--accent) text-[11px] font-medium text-left"
            >
              <div className="font-semibold text-(--foreground)">HR Manager</div>
              <div className="text-(--muted-foreground) truncate">Dwight Schrute</div>
            </button>
            <button
              onClick={() => handleQuickRole("EMPLOYEE", "jim.halpert@dundermifflin.com")}
              className="p-2 rounded-lg border border-(--border) hover:bg-(--accent) text-[11px] font-medium text-left"
            >
              <div className="font-semibold text-(--foreground)">Employee</div>
              <div className="text-(--muted-foreground) truncate">Jim Halpert</div>
            </button>
            <button
              onClick={() => handleQuickRole("ADMIN", "admin@dundermifflin.com")}
              className="p-2 rounded-lg border border-(--border) hover:bg-(--accent) text-[11px] font-medium text-left"
            >
              <div className="font-semibold text-(--foreground)">System Admin</div>
              <div className="text-(--muted-foreground) truncate">Root Security</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
