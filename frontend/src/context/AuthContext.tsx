"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Role, UserSession } from "@/types";
import { apiClient } from "@/services/apiClient";

interface AuthContextType {
  user: UserSession | null;
  role: Role;
  login: (session: UserSession) => void;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const DEFAULT_DEMO_USER: UserSession = {
  id: "00000000-0000-0000-0000-000000000003",
  email: "payrollmanager@peoplepay360.com",
  firstName: "Michael",
  lastName: "Scott",
  role: "HR_PAYROLL_MANAGER",
};

const ROLE_PROFILES: Record<Role, { email: string; pass: string; name: string; id: string }> = {
  ADMIN: { id: "00000000-0000-0000-0000-000000000001", email: "admin@peoplepay360.com", pass: "Admin@123", name: "System Admin" },
  HR_MANAGER: { id: "00000000-0000-0000-0000-000000000002", email: "hrmanager@peoplepay360.com", pass: "HrManager@123", name: "Sarah Connor" },
  HR_PAYROLL_MANAGER: { id: "00000000-0000-0000-0000-000000000003", email: "payrollmanager@peoplepay360.com", pass: "PayrollManager@123", name: "Michael Scott" },
  HR_PAYROLL_USER: { id: "00000000-0000-0000-0000-000000000004", email: "payrolluser@peoplepay360.com", pass: "PayrollUser@123", name: "Dwight Schrute" },
  EMPLOYEE: { id: "00000000-0000-0000-0000-000000000005", email: "john.doe@peoplepay360.com", pass: "Employee@123", name: "John Doe" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Hydration-safe initial local storage read
    const saved = localStorage.getItem("peoplepay_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_DEMO_USER);
      }
    } else {
      setUser(DEFAULT_DEMO_USER);
      localStorage.setItem("peoplepay_user", JSON.stringify(DEFAULT_DEMO_USER));
    }
  }, []);

  const login = (session: UserSession) => {
    setUser(session);
    localStorage.setItem("peoplepay_user", JSON.stringify(session));
    if (session.token) {
      localStorage.setItem("peoplepay_token", session.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("peoplepay_user");
    localStorage.removeItem("peoplepay_token");
    apiClient.clearCache();
  };

  const switchRole = async (newRole: Role) => {
    apiClient.clearCache();
    const profile = ROLE_PROFILES[newRole];
    if (!profile) return;

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, password: profile.pass }),
      });
      if (res.ok) {
        const json = await res.json();
        const token = json?.data?.accessToken;
        if (token) {
          localStorage.setItem("peoplepay_token", token);
        }
      }
    } catch {
      // Offline fallback
    }

    const updated: UserSession = {
      id: profile.id,
      email: profile.email,
      firstName: profile.name.split(" ")[0],
      lastName: profile.name.split(" ")[1] || "",
      role: newRole,
    };

    setUser(updated);
    localStorage.setItem("peoplepay_user", JSON.stringify(updated));
  };

  const hasRole = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "EMPLOYEE",
        login,
        logout,
        switchRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
