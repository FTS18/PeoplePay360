import { apiClient } from "./apiClient";
import { PageResponse, TimeOffAllocation, TimeOffBalance, TimeOffRequest, TimeOffType } from "@/types";

export interface CreateLeavePayload {
  employeeId: string;
  timeOffTypeId: string;
  startDate: string;
  endDate: string;
  requestedUnits: number;
  reason?: string;
}

export interface CreateAllocationPayload {
  employeeId: string;
  timeOffTypeId: string;
  allocatedUnits: number;
  validFrom: string;
  validTo: string;
}

export const timeoffService = {
  getTypes: () => apiClient.get<TimeOffType[]>("/timeoff/types"),

  getBalances: (employeeId: string, asOfDate?: string) => {
    const params = new URLSearchParams({ employeeId });
    if (asOfDate) params.append("asOfDate", asOfDate);
    return apiClient.get<TimeOffBalance[]>(`/timeoff/balances?${params.toString()}`);
  },

  getRequests: (employeeId?: string, page = 0, size = 15) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (employeeId) params.append("employeeId", employeeId);
    return apiClient.get<PageResponse<TimeOffRequest>>(`/timeoff/requests?${params.toString()}`);
  },

  getAllocations: (employeeId?: string, page = 0, size = 20) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (employeeId) params.append("employeeId", employeeId);
    return apiClient.get<PageResponse<TimeOffAllocation>>(`/timeoff/allocations?${params.toString()}`);
  },

  createAllocation: (payload: CreateAllocationPayload) =>
    apiClient.post<TimeOffAllocation>("/timeoff/allocations", payload),

  approveAllocation: (id: string) =>
    apiClient.put<TimeOffAllocation>(`/timeoff/allocations/${id}/approve`),

  applyLeave: (payload: CreateLeavePayload) =>
    apiClient.post<TimeOffRequest>("/timeoff/requests", payload),

  approveRequest: (id: string) =>
    apiClient.put<TimeOffRequest>(`/timeoff/requests/${id}/approve`),

  refuseRequest: (id: string, reason?: string) => {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiClient.put<TimeOffRequest>(`/timeoff/requests/${id}/refuse${params}`);
  },
};
