"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Square, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/services/apiClient";

export function PunchClockWidget() {
  const { user } = useAuth();
  const [time, setTime] = useState<string>("");
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastPunch, setLastPunch] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunch = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      if (!isPunchedIn) {
        await apiClient.post("/attendance/punch-in", { employeeId: user.id });
        setIsPunchedIn(true);
        setLastPunch(`In at ${new Date().toLocaleTimeString()}`);
      } else {
        await apiClient.post("/attendance/punch-out", { employeeId: user.id });
        setIsPunchedIn(false);
        setLastPunch(`Out at ${new Date().toLocaleTimeString()}`);
      }
    } catch {
      // Fallback for mock/demo mode
      setIsPunchedIn(!isPunchedIn);
      setLastPunch(
        !isPunchedIn
          ? `In at ${new Date().toLocaleTimeString()}`
          : `Out at ${new Date().toLocaleTimeString()}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[oklch(92%_0.005_240)] bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3.5 border-b border-[oklch(92%_0.005_240)]">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[oklch(50%_0.02_240)]" strokeWidth={1.5} />
          <span className="text-xs font-semibold uppercase tracking-wider text-[oklch(20%_0.02_240)]">
            Attendance Punch
          </span>
        </div>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isPunchedIn ? "bg-[oklch(75%_0.16_150)] animate-pulse" : "bg-slate-300"
          }`}
        />
      </div>

      <div className="my-5 text-center">
        <div className="text-3xl font-bold tracking-tight text-[oklch(20%_0.02_240)] tabular-nums">
          {time || "--:--:--"}
        </div>
        <p className="mt-1 text-xs text-[oklch(50%_0.02_240)]">
          {lastPunch || "Not checked in today"}
        </p>
      </div>

      <button
        onClick={handlePunch}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium transition-all ${
          isPunchedIn
            ? "bg-[oklch(94%_0.05_30)] text-[oklch(40%_0.18_30)] hover:bg-[oklch(90%_0.08_30)] border border-[oklch(88%_0.08_30)]"
            : "bg-[oklch(18%_0.03_195)] text-[oklch(95%_0.01_195)] hover:bg-[oklch(25%_0.04_195)] shadow-xs"
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
        ) : isPunchedIn ? (
          <>
            <Square className="h-3.5 w-3.5" strokeWidth={1.5} />
            Clock Out
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            Clock In
          </>
        )}
      </button>
    </div>
  );
}
