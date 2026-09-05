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
}
