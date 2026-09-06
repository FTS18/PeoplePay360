"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Play, Square, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { attendanceService } from "@/services/attendanceService";

export function PunchClockWidget() {
  const { user, role } = useAuth();
  const [time, setTime] = useState<string>("");
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastPunch, setLastPunch] = useState<string | null>(null);

  if (role === "ADMIN") {
    return (
      <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
          <Clock className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <h4 className="text-xs font-bold text-foreground">System Administrator Profile</h4>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Biometric punch terminal is disabled for executive administrator accounts.
        </p>
      </div>
    );
  }

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

  const syncTodayStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await attendanceService.getAll(0, 5, user.id);
      const todayRecord = res?.content?.find((r) => r.date === todayStr);
      if (todayRecord) {
        if (todayRecord.checkIn && !todayRecord.checkOut) {
          setIsPunchedIn(true);
          const inTime = new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPunch(`In at ${inTime}`);
        } else if (todayRecord.checkOut) {
          setIsPunchedIn(false);
          const outTime = new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastPunch(`Out at ${outTime} (${todayRecord.workedHours ?? 0}h)`);
        }
      } else {
        setIsPunchedIn(false);
        setLastPunch("Not checked in today");
      }
    } catch {
      // Graceful fallback
    }
  }, [user?.id]);

  useEffect(() => {
    syncTodayStatus();
  }, [syncTodayStatus]);

  const handlePunch = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const record = await attendanceService.punch({
        employeeId: user.id,
        date: todayStr,
      });

      if (record.checkIn && !record.checkOut) {
        setIsPunchedIn(true);
        const inTime = new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastPunch(`In at ${inTime}`);
      } else if (record.checkOut) {
        setIsPunchedIn(false);
        const outTime = new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastPunch(`Out at ${outTime} (${record.workedHours ?? 0}h)`);
      }
    } catch (err: any) {
      console.error("Attendance punch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] bg-white/95 dark:bg-[var(--card)] p-5 shadow-apple-sm backdrop-blur-md">
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--muted)] dark:bg-stone-800 text-stone-500 flex items-center justify-center">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Attendance Punch
          </span>
        </div>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isPunchedIn ? "bg-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-stone-300 dark:bg-stone-700"
          }`}
        />
      </div>

      <div className="my-5 text-center">
        <div className="text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums tabular-nums" suppressHydrationWarning>
          {time || "--:--:--"}
        </div>
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)] font-medium" suppressHydrationWarning>
          {lastPunch || "Not checked in today"}
        </p>
      </div>

      <button
        onClick={handlePunch}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer apple-press ${
          isPunchedIn
            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 shadow-xs"
            : "bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-md shadow-teal-900/20"
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
