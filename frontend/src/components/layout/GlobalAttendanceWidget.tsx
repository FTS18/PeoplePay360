"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, X, Play, Square, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { attendanceService } from "@/services/attendanceService";

export function GlobalAttendanceWidget() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedStr, setElapsedStr] = useState<string>("0h 00m");
  const [loading, setLoading] = useState(false);

  if (role === "ADMIN") return null;

  // Live elapsed timer calculation
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) {
      setElapsedStr("0h 00m");
      return;
    }

    const updateTimer = () => {
      const diffMs = new Date().getTime() - checkInTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      setElapsedStr(`${hours}h ${mins < 10 ? "0" : ""}${mins}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  const handleTogglePunch = async () => {
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

      if (currentlyIn && record.checkIn) {
        setCheckInTime(new Date(record.checkIn));
      } else {
        setCheckInTime(null);
      }
    } catch (err) {
      console.error("Attendance quick punch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const formattedStartTime = checkInTime
    ? checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "9:48 AM";

  return (
    <div className="relative">
      {/* Global Navbar Quick Icon Button with Status Dot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="apple-press relative flex items-center justify-center h-8 w-8 rounded-full bg-card border border-border hover:bg-muted transition-all shadow-2xs cursor-pointer"
        title="Attendance Quick Punch Widget"
        aria-label="Attendance Quick Punch Widget"
      >
        <Clock className="h-4 w-4 text-foreground" strokeWidth={1.5} />
        {/* Status Indicator Dot: Green when active/checked-in, Red when off-duty */}
        <span
          className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
            isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
          }`}
        />
      </button>

      {/* Attendance Quick Widget Popup Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-border bg-card p-5 shadow-apple-modal z-50 animate-in fade-in space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Attendance Widget</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Welcome Text */}
          <div>
            <p className="text-[11px] text-muted-foreground">Welcome back</p>
            <h4 className="text-sm font-bold text-foreground">
              {user ? `${user.firstName} ${user.lastName}!` : "User Name!"}
            </h4>
          </div>

          {/* Time & Duration Row */}
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-xs tabular-nums">
              <span className="text-muted-foreground font-medium">
                {isCheckedIn ? `${formattedStartTime} — Now` : "Off Duty"}
              </span>
              <span className="font-bold text-foreground">{elapsedStr}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60 tabular-nums">
              <span className="text-muted-foreground font-semibold">Today</span>
              <span className="font-bold text-foreground">{elapsedStr}</span>
            </div>
          </div>

          {/* Main Action Button */}
          <button
            onClick={handleTogglePunch}
            disabled={loading}
            className={`apple-press w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-xs transition-all cursor-pointer ${
              isCheckedIn
                ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                : "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Updating..." : isCheckedIn ? "Check Out" : "Check In"}
          </button>

          {/* Subtext */}
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            Employees can mark attendance from the quick widget and review records from the Attendance module.
          </p>
        </div>
      )}
    </div>
  );
}
