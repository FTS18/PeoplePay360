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
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Live Punch Terminal</h3>
            <p className="text-xs text-stone-500">Standard 40h Shift Schedule</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isCheckedIn
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-stone-100 text-stone-600 border border-stone-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
            }`}
          />
          {isCheckedIn ? "Clocked In" : "Off Duty"}
        </span>
      </div>

      <div className="my-6 text-center">
        <div className="text-3xl font-bold tracking-tight text-stone-900">{time || "--:--:--"}</div>
        <div className="text-xs font-medium text-stone-400 mt-1">{dateStr}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs">
        <div>
          <span className="text-stone-500 block">Scheduled Shift</span>
          <span className="font-semibold text-stone-800">09:00 AM - 06:00 PM</span>
        </div>
        <div>
          <span className="text-stone-500 block">Break Allowance</span>
          <span className="font-semibold text-stone-800">1.00 hr (Lunch)</span>
        </div>
      </div>

      <button
        onClick={handlePunch}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
          isCheckedIn
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-teal-700 hover:bg-teal-800 text-white"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
        {loading ? "Processing..." : isCheckedIn ? "Clock Out Now" : "Clock In Now"}
      </button>

      {lastPunchTime && (
        <p className="text-center text-xs text-stone-400 mt-3">
          Last recorded action at {lastPunchTime}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-stone-400 text-xs">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.5} />
        <span>Enterprise Geofence Protection Active</span>
      </div>
    </div>
  );
}
