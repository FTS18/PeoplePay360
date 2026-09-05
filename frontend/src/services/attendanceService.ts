import { apiClient } from "./apiClient";
import { AttendanceRecord, AttendanceStatus, PageResponse } from "@/types";

export interface PunchPayload {
  employeeId: string;
  date: string;
  timestamp?: string;
}

export interface OverridePayload {
  checkIn?: string;
  checkOut?: string;
  workedHours: number;
  status: AttendanceStatus;
  overrideReason: string;
}

export const attendanceService = {
  getAll: (page = 0, size = 15, employeeId?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (employeeId) params.append("employeeId", employeeId);
    return apiClient.get<PageResponse<AttendanceRecord>>(`/attendance?${params.toString()}`);
  },

  punch: (payload: PunchPayload) =>
    apiClient.post<AttendanceRecord>("/attendance/punch", payload),

  getEmployeeRecords: (employeeId: string, startDate: string, endDate: string) =>
    apiClient.get<AttendanceRecord[]>(
      `/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    ),

  getAnomalies: (startDate: string, endDate: string, page = 0, size = 15) =>
    apiClient.get<PageResponse<AttendanceRecord>>(
      `/attendance/anomalies?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    ),

  overrideRecord: (id: string, payload: OverridePayload) =>
    apiClient.put<AttendanceRecord>(`/attendance/${id}/override`, payload),
};
