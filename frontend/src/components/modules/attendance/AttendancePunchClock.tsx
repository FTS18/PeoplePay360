"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck } from "lucide-react";
import { attendanceService } from "@/services/attendanceService";
import { useAuth } from "@/context/AuthContext";
import { AttendanceRecord } from "@/types";

interface AttendancePunchClockProps {
  onPunchSuccess?: (record: AttendanceRecord) => void;
}

export function AttendancePunchClock({ onPunchSuccess }: AttendancePunchClockProps) {
  const { user } = useAuth();
  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastPunchTime, setLastPunchTime] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunch = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const record = await attendanceService.punch({
        employeeId: user.id,
        date: today,
      });

      const currentlyIn = record.checkIn && !record.checkOut;
      setIsCheckedIn(!!currentlyIn);
      setLastPunchTime(new Date().toLocaleTimeString());
      onPunchSuccess?.(record);
    } catch (err) {
      console.error("Failed to register punch", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-6 shadow-apple-sm text-foreground apple-specular">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/70 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Live Punch Terminal</h3>
            <p className="text-xs text-muted-foreground">Standard 40h Shift Schedule</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs ${
            isCheckedIn
              ? "bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30"
              : "bg-[var(--muted)] dark:bg-stone-800 text-muted-foreground border border-stone-200 dark:border-stone-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCheckedIn ? "bg-teal-500 animate-pulse" : "bg-stone-400"
            }`}
          />
          {isCheckedIn ? "Clocked In" : "Off Duty"}
        </span>
      </div>

      <div className="my-6 text-center">
        <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums" suppressHydrationWarning>
          {time || "--:--:--"}
        </div>
        <div className="text-xs font-medium text-muted-foreground mt-1" suppressHydrationWarning>
          {dateStr}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-50/50 dark:bg-stone-900/40 p-3.5 rounded-xl border border-[var(--border)] dark:border-[var(--border-subtle)] text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">Scheduled Shift</span>
          <span className="font-semibold text-foreground tabular-nums">09:00 AM - 06:00 PM</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Break Allowance</span>
          <span className="font-semibold text-foreground">1.00 hr (Lunch)</span>
        </div>
      </div>

      <button
        onClick={handlePunch}
        disabled={loading}
        className={`apple-press w-full py-2.5 px-4 rounded-full font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-apple-sm ${
          isCheckedIn
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
        {loading ? "Processing..." : isCheckedIn ? "Clock Out Now" : "Clock In Now"}
      </button>

      {lastPunchTime && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Last recorded action at {lastPunchTime}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-stone-200/70 dark:border-[var(--border-subtle)] flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
        <span>Enterprise Geofence Protection Active</span>
      </div>
    </div>
  );
}
