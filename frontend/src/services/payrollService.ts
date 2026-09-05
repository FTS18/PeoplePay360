import { apiClient } from "./apiClient";
import { PageResponse, Payrun, Payslip, SalaryStructure } from "@/types";

export interface CreatePayrunPayload {
  name: string;
  salaryStructureId: string;
  periodStart: string;
  periodEnd: string;
}

export interface PayrollWarning {
  employeeCode?: string;
  employeeName?: string;
  warningCode: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export const payrollService = {
  getPayruns: (page = 0, size = 15) =>
    apiClient.get<PageResponse<Payrun>>(`/payroll/payruns?page=${page}&size=${size}`),

  getPayrunById: (id: string) =>
    apiClient.get<Payrun>(`/payroll/payruns/${id}`),

  createDraft: (payload: CreatePayrunPayload) =>
    apiClient.post<Payrun>("/payroll/payruns", payload),

  computeBatch: (id: string, employeeIds?: string[]) =>
    apiClient.post<Payrun>(`/payroll/payruns/${id}/compute`, { employeeIds }),

  validatePayrun: (id: string) =>
    apiClient.get<PayrollWarning[]>(`/payroll/payruns/${id}/validate`),

  markAsPaid: (id: string) =>
    apiClient.post<Payrun>(`/payroll/payruns/${id}/pay`),

  getPayslips: (payrunId?: string, page = 0, size = 20, employeeId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (payrunId) params.append("payrunId", payrunId);
    if (employeeId) params.append("employeeId", employeeId);
    return apiClient.get<PageResponse<Payslip>>(`/payroll/payslips?${params.toString()}`);
  },

  getPayslipDetails: (id: string) =>
    apiClient.get<Payslip>(`/payroll/payslips/${id}`),

  getPdfUrl: (id: string) => `/api/v1/payroll/payslips/${id}/pdf`,

  sendPayslips: (id: string) =>
    apiClient.post<string>(`/payroll/payruns/${id}/send-payslips`),

  getStructures: () =>
    apiClient.get<SalaryStructure[]>("/payroll/structures"),
};
