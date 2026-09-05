import { apiClient } from "@/services/apiClient";
import { WorkingSchedule } from "@/types";

export interface ScheduleLinePayload {
  dayOfWeek: string;
  startTime: string; // "09:00:00" or "09:00"
  endTime: string;   // "17:00:00" or "17:00"
  breakHours: number;
}

export interface CreateSchedulePayload {
  name: string;
  type: "STANDARD" | "SHIFT" | "FLEXIBLE";
  lines: ScheduleLinePayload[];
}

export const scheduleService = {
  getAll: () => apiClient.get<WorkingSchedule[]>("/schedules"),

  getById: (id: string) => apiClient.get<WorkingSchedule>(`/schedules/${id}`),

  create: (payload: CreateSchedulePayload) =>
    apiClient.post<WorkingSchedule>("/schedules", payload),

  update: (id: string, payload: CreateSchedulePayload) =>
    apiClient.put<WorkingSchedule>(`/schedules/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`/schedules/${id}`),
};
