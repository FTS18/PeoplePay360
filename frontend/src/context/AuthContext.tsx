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
  id: "3913c49f-ed1d-452f-a888-742d2ea048b8",
  email: "payrollmanager@peoplepay360.com",
  firstName: "Rajesh",
  lastName: "Sharma",
  role: "HR_PAYROLL_MANAGER",
};

const ROLE_PROFILES: Record<Role, { email: string; pass: string; name: string; id: string }> = {
  ADMIN: { id: "daed6b24-c7fd-4738-9228-71b5c871e17a", email: "admin@peoplepay360.com", pass: "Admin@123", name: "Aarav Sharma" },
  HR_MANAGER: { id: "8c1952f1-3943-4521-9602-086aefdcbdd9", email: "hrmanager@peoplepay360.com", pass: "HrManager@123", name: "Priya Nair" },
  HR_PAYROLL_MANAGER: { id: "3913c49f-ed1d-452f-a888-742d2ea048b8", email: "payrollmanager@peoplepay360.com", pass: "PayrollManager@123", name: "Rajesh Sharma" },
  HR_PAYROLL_USER: { id: "75056e7b-1aeb-4bb1-b2af-8d406e8222fa", email: "payrolluser@peoplepay360.com", pass: "PayrollUser@123", name: "Amit Verma" },
  EMPLOYEE: { id: "83264985-a4ae-4609-9886-4bfaed2bc76d", email: "john.doe@peoplepay360.com", pass: "Employee@123", name: "Rahul Sharma" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Hydration-safe initial local storage read with stale profile migration
    const loggedOut = localStorage.getItem("peoplepay_logged_out") === "true";
    const saved = localStorage.getItem("peoplepay_user");

    if (loggedOut) {
      setUser(null);
      return;
    }

    if (saved) {
      try {
        const parsed: UserSession = JSON.parse(saved);
        const matchingProfile = ROLE_PROFILES[parsed.role as Role];
        if (
          matchingProfile &&
          (parsed.firstName === "Sarah" ||
            parsed.firstName === "Michael" ||
            parsed.firstName === "Dwight" ||
            parsed.firstName === "John" ||
            parsed.firstName === "Jane" ||
            parsed.firstName === "System")
        ) {
          const [fName, ...lNames] = matchingProfile.name.split(" ");
          parsed.firstName = fName;
          parsed.lastName = lNames.join(" ");
          parsed.email = matchingProfile.email;
          localStorage.setItem("peoplepay_user", JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch {
        setUser(DEFAULT_DEMO_USER);
      }
    } else {
      setUser(DEFAULT_DEMO_USER);
      localStorage.setItem("peoplepay_user", JSON.stringify(DEFAULT_DEMO_USER));
    }
  }, []);

  const login = (session: UserSession) => {
    localStorage.removeItem("peoplepay_logged_out");
    setUser(session);
    localStorage.setItem("peoplepay_user", JSON.stringify(session));
    if (session.token) {
      localStorage.setItem("peoplepay_token", session.token);
    }
    if (session.refreshToken) {
      localStorage.setItem("peoplepay_refresh_token", session.refreshToken);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("peoplepay_refresh_token") : null;
      await apiClient.post("/auth/logout", { refreshToken }).catch(() => {});
    } catch {
      // Graceful degradation on network error
    } finally {
      setUser(null);
      localStorage.setItem("peoplepay_logged_out", "true");
      localStorage.removeItem("peoplepay_user");
      localStorage.removeItem("peoplepay_token");
      localStorage.removeItem("peoplepay_refresh_token");
      apiClient.clearCache();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
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
        const refreshToken = json?.data?.refreshToken;
        if (token) {
          localStorage.setItem("peoplepay_token", token);
        }
        if (refreshToken) {
          localStorage.setItem("peoplepay_refresh_token", refreshToken);
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
