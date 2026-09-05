package com.peoplepay360.modules.dashboard.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private BigDecimal totalNetSalaryPaid;
    private BigDecimal averageSalary;
    private long activeEmployeesCount;
    private long runningContractsCount;
    private long pendingLeaveRequestsCount;
    private long todayPresentCount;
    private long todayLateCount;
    private long todayAbsentCount;
    private long todayOvertimeCount;
    private long todayMissingCheckInsCount;
    private long manualAttendanceEditsCount;
    private long refusedLeaveRequestsCount;

    private long payslipsGenerated;
    private long approvedTimeOffDays;
    private double attendanceHealthRatio;

    private long draftPayslipsCount;
    private long computedPayslipsCount;
    private long validatedPayslipsCount;
    private long paidPayslipsCount;

    private long payrollWarningsCount;
    private java.util.List<PayrollWarningDto> payrollWarnings;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PayrollWarningDto {
        private String id;
        private String title;
        private String description;
        private String category; // e.g. "MISSING_ACCOUNT", "NO_CONTRACT", "PAYRUN_DRAFT"
        private String severity; // "HIGH", "MEDIUM", "LOW"
        private String link;
    }
}
