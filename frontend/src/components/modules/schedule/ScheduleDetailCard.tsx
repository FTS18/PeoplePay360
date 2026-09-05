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
    <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-stone-900">{schedule.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-teal-50 text-teal-700 border border-teal-200">
              {schedule.type}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {schedule.lines?.length || 0} active working day(s) configured
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(schedule)}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Edit Schedule"
            >
              <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Schedule"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-stone-100">
        <div className="bg-stone-50 rounded-xl p-2.5">
          <span className="text-[10px] font-medium text-stone-500 block">Weekly Hours</span>
          <span className="text-sm font-bold text-stone-900">{Number(schedule.totalWeeklyHours || 0).toFixed(1)} hrs</span>
        </div>
        <div className="bg-stone-50 rounded-xl p-2.5">
          <span className="text-[10px] font-medium text-stone-500 block">Avg / Work Day</span>
          <span className="text-sm font-bold text-stone-900">{Number(schedule.averageHoursPerDay || 0).toFixed(1)} hrs</span>
        </div>
      </div>

      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-medium text-stone-500 hover:text-stone-800 py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
            {expanded ? "Hide Day Breakdown" : "View Day Breakdown"}
          </span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} /> : <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-2 text-xs">
            {schedule.lines && schedule.lines.length > 0 ? (
              schedule.lines.map((line) => (
                <div key={line.id || line.dayOfWeek} className="flex items-center justify-between py-1 text-stone-600">
                  <span className="font-medium text-stone-800 w-24 capitalize">{line.dayOfWeek.toLowerCase()}</span>
                  <span className="text-stone-500">
                    {line.startTime.slice(0, 5)} - {line.endTime.slice(0, 5)}
                  </span>
                  <span className="text-stone-400 text-[11px]">Break: {Number(line.breakHours || 0)}h</span>
                  <span className="font-semibold text-stone-800 text-[11px]">{Number(line.workHours || 0).toFixed(1)}h</span>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-xs italic py-1">No lines configured</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
