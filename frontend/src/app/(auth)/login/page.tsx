"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Mail, ArrowRight, Sparkles, UserCircle2, Briefcase, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { ROUTES } from "@/config/routes";
import { getDepartmentLead } from "@/utils/departmentLead";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState<Role>("HR_PAYROLL_MANAGER");
  const [demoUsers, setDemoUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const FALLBACK_DEMO_USERS: Record<Role, any[]> = {
    ADMIN: [
      { id: "c8093365-805b-46a4-8002-79f0e218cd84", email: "shikharyadav595@gmail.com", fullName: "Aarav Sharma", employeeCode: "EMP001", jobPosition: "Chief Executive Officer", role: "ADMIN" },
      { id: "bd5ebf12-eaa3-4ba9-a199-036261b96958", email: "dubeyananay@gmail.com", fullName: "Priya Nair", employeeCode: "EMP002", jobPosition: "Chief Technology Officer", role: "ADMIN" }
    ],
    HR_PAYROLL_MANAGER: [
      { id: "8932c43a-f5e8-43d0-baf9-706049870542", email: "vp.finance@peoplepay360.com", fullName: "Siddharth Joshi", employeeCode: "EMP007", jobPosition: "VP Finance", role: "HR_PAYROLL_MANAGER" }
    ],
    HR_MANAGER: [
      { id: "ac38d85f-04be-405d-8e93-4099fcd24a14", email: "vp.people@peoplepay360.com", fullName: "Ananya Kulkarni", employeeCode: "EMP006", jobPosition: "VP People", role: "HR_MANAGER" }
    ],
    HR_PAYROLL_USER: [
      { id: "lead-emp025-id", email: "lead.emp025@peoplepay360.com", fullName: "Payroll Officer", employeeCode: "EMP025", jobPosition: "Payroll Officer", role: "HR_PAYROLL_USER" }
    ],
    EMPLOYEE: [
      { id: "5223ffc9-ce9d-4374-9966-a28144ae9976", email: "gishan750@gmail.com", fullName: "Rajesh Gupta", employeeCode: "EMP003", jobPosition: "VP Engineering", role: "EMPLOYEE" }
    ],
  };

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await fetch(`/api/v1/auth/demo-users?role=${selectedRole}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data) && json.data.length > 0) {
            setDemoUsers(json.data);
            return;
          }
        }
        setDemoUsers(FALLBACK_DEMO_USERS[selectedRole] || []);
      } catch {
        setDemoUsers(FALLBACK_DEMO_USERS[selectedRole] || []);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [selectedRole]);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      if (res.ok) {
        const json = await res.json();
        const userData = json?.data?.user;
        const accessToken = json?.data?.accessToken;
        const refreshToken = json?.data?.refreshToken;
        
        if (userData) {
          login({
            id: userData.id,
            email: userData.email,
            firstName: userData.fullName.split(" ")[0],
            lastName: userData.fullName.split(" ")[1] || "",
            role: userData.role,
            token: accessToken,
            refreshToken: refreshToken,
          });
          router.push("/dashboard");
        }
      } else {
        const errJson = await res.json().catch(() => null);
        setError(errJson?.message || "Invalid credentials. Please verify your work email and password.");
        setIsLoading(false);
      }
    } catch {
      setError("Unable to connect to authentication server. Please check your network connection.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickRole = (role: Role, roleEmail: string) => {
    setEmail(roleEmail);
    let demoPass = "Employee@123";
    if (role === "ADMIN") demoPass = "Admin@123";
    if (role === "HR_MANAGER") demoPass = "HrManager@123";
    if (role === "HR_PAYROLL_MANAGER") demoPass = "PayrollManager@123";
    if (role === "HR_PAYROLL_USER") demoPass = "PayrollUser@123";
    
    setPassword(demoPass);
    performLogin(roleEmail, demoPass);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 dark:bg-[#0a0a0a]">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-teal-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse-slow" />
      <div className="pointer-events-none absolute top-1/4 -right-20 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen opacity-50" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-sky-500/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-60" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 sm:mx-0 space-y-6 sm:space-y-8 rounded-[28px] sm:rounded-[32px] border border-white/60 dark:border-white/10 bg-white/70 dark:bg-black/40 p-5 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg shadow-teal-500/30 ring-1 ring-white/20">
            <CreditCard className="h-7 w-7" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white dark:ring-black">
              <Sparkles className="h-2.5 w-2.5 text-amber-900" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">PeoplePay360</h1>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Enterprise HR & Payroll Operations
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-500/25 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wide text-stone-500 dark:text-stone-400 uppercase ml-1">
                Work Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 group-focus-within:text-teal-500 transition-colors" strokeWidth={1.75} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-black/50 py-2.5 pl-10 pr-3.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold tracking-wide text-stone-500 dark:text-stone-400 uppercase">
                  Password
                </label>
                <Link href="#" className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 group-focus-within:text-teal-500 transition-colors" strokeWidth={1.75} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-black/50 py-2.5 pl-10 pr-3.5 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/40 transition-all font-medium tracking-widest"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? "Authenticating..." : "Sign In to Workspace"}
            {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />}
          </button>
        </form>

        {/* Quick Persona Switcher */}
        <div className="pt-2">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-stone-50 dark:bg-[#0a0a0a] px-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 rounded-full">
                Demo User Selector
              </span>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 sm:flex sm:items-center bg-stone-200/50 dark:bg-stone-900/50 p-1 rounded-xl mb-3 gap-1">
            {[
              { role: "ADMIN", label: "ADMIN" },
              { role: "HR_PAYROLL_MANAGER", label: "PAYROLL MGR" },
              { role: "HR_PAYROLL_USER", label: "PAYROLL USER" },
              { role: "HR_MANAGER", label: "HR" },
              { role: "EMPLOYEE", label: "EMPLOYEE" },
            ].map(({ role, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role as Role)}
                className={`flex-1 py-1.5 text-[9px] font-bold tracking-wider rounded-lg transition-all truncate px-1 ${
                  selectedRole === role
                    ? "bg-white dark:bg-stone-800 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Users List */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
            {isLoadingUsers ? (
              <div className="text-center py-4 text-xs font-medium text-stone-400">Loading users...</div>
            ) : demoUsers.length === 0 ? (
              <div className="text-center py-4 text-xs font-medium text-stone-400">No users found for this role</div>
            ) : (
              demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickRole(u.role as Role, u.email)}
                  className="w-full group flex items-center justify-between p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-800/60 bg-white/40 dark:bg-white/[0.02] hover:bg-teal-50/50 dark:hover:bg-teal-500/10 hover:border-teal-200 dark:hover:border-teal-500/30 transition-all text-left active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-400">
                      <UserCircle2 className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                        {u.fullName} <span className="font-normal text-stone-400">({u.employeeCode})</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3 w-3 text-stone-400" />
                        <div className="text-[10px] font-medium text-stone-500 dark:text-stone-400 truncate">
                          {u.jobPosition} • <span className="text-teal-600 dark:text-teal-400 font-semibold">HR Lead: {getDepartmentLead(u.department).name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="text-center text-xs font-medium text-stone-500 dark:text-stone-400 pt-2">
          New employee?{" "}
          <Link href={ROUTES.SIGNUP} className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">
            Self-Onboard Here
          </Link>
        </div>
      </div>
    </div>
  );
}
