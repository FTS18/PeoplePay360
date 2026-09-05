"use client";

import React, { useState } from "react";
import { Clock, Calendar, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { WorkingSchedule } from "@/types";

interface ScheduleDetailCardProps {
  schedule: WorkingSchedule;
  canManage: boolean;
  onEdit: (schedule: WorkingSchedule) => void;
  onDelete: (id: string) => void;
}

export function ScheduleDetailCard({ schedule, canManage, onEdit, onDelete }: ScheduleDetailCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-[var(--border)] dark:border-[var(--border-subtle)] p-5 shadow-apple-sm hover:shadow-apple-md transition-all text-foreground apple-specular flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">{schedule.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                {schedule.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {schedule.lines?.length || 0} active working day(s) configured
            </p>
          </div>

          {canManage && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(schedule)}
                className="apple-press p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Edit Schedule"
              >
                <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => onDelete(schedule.id)}
                className="apple-press p-1.5 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Delete Schedule"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-stone-200/70 dark:border-[var(--border-subtle)]">
          <div className="bg-stone-50/50 dark:bg-stone-900/40 rounded-xl p-3 border border-[var(--border)] dark:border-[var(--border-subtle)]">
            <span className="text-[10px] font-medium text-muted-foreground block">Weekly Hours</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{Number(schedule.totalWeeklyHours || 0).toFixed(1)} hrs</span>
          </div>
          <div className="bg-stone-50/50 dark:bg-stone-900/40 rounded-xl p-3 border border-[var(--border)] dark:border-[var(--border-subtle)]">
            <span className="text-[10px] font-medium text-muted-foreground block">Avg / Work Day</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{Number(schedule.averageHoursPerDay || 0).toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="apple-press w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground py-1 cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
            <span>{expanded ? "Hide Day Breakdown" : "View Day Breakdown"}</span>
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} /> : <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />}
        </button>

        {expanded && (
          <div className="mt-2.5 space-y-1.5 border-t border-stone-200/70 dark:border-[var(--border-subtle)] pt-2 text-xs">
            {schedule.lines && schedule.lines.length > 0 ? (
              schedule.lines.map((line) => (
                <div key={line.id || line.dayOfWeek} className="flex items-center justify-between py-1 text-muted-foreground">
                  <span className="font-semibold text-foreground w-24 capitalize">{line.dayOfWeek.toLowerCase()}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {line.startTime.slice(0, 5)} - {line.endTime.slice(0, 5)}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)]">Break: {Number(line.breakHours || 0)}h</span>
                  <span className="font-semibold text-foreground tabular-nums text-[11px]">{Number(line.workHours || 0).toFixed(1)}h</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-xs italic py-1">No lines configured</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
