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

// In production this should be null / redirect to login — the guest default is EMPLOYEE
// with read-only access, not a manager role.
const GUEST_USER: UserSession = {
  id: "",
  email: "",
  firstName: "Guest",
  lastName: "",
  role: "EMPLOYEE",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Hydration-safe: only read localStorage after mount.
    const loggedOut = localStorage.getItem("peoplepay_logged_out") === "true";
    if (loggedOut) {
      setUser(null);
      return;
    }

    const saved = localStorage.getItem("peoplepay_user");
    if (saved) {
      try {
        const parsed: UserSession = JSON.parse(saved);
        setUser(parsed);
      } catch {
        setUser(null);
        localStorage.removeItem("peoplepay_user");
      }
    } else {
      // No stored session — leave user null so the app redirects to login.
      setUser(null);
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
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("peoplepay_refresh_token")
          : null;
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
    // Delegates to the login page / backend auth — no credentials stored in client code.
    if (typeof window !== "undefined") {
      window.location.href = `/login?role=${newRole}`;
    }
  };

  const hasRole = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? "EMPLOYEE",
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
