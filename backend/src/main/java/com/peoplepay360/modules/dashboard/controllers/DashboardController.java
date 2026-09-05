package com.peoplepay360.modules.dashboard.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import com.peoplepay360.modules.dashboard.dto.responses.DashboardSummaryResponse;
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository;
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository.DepartmentCostProjection;
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository.MonthlyPayrollTrendProjection;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardQueryRepository dashboardQueryRepository;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final TimeOffRequestRepository timeOffRequestRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(required = false) LocalDate sinceDate
    ) {
        LocalDate queryDate = sinceDate != null ? sinceDate : LocalDate.now().minusMonths(12);

        BigDecimal totalPaid = dashboardQueryRepository.sumTotalNetSalaryPaid(queryDate);
        BigDecimal avgSalary = dashboardQueryRepository.calculateAverageNetSalary(queryDate);
        long activeEmp = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long runningContracts = contractRepository.countByStatus(ContractStatus.RUNNING);
        long pendingLeaves = timeOffRequestRepository.countByStatus(TimeOffStatus.CONFIRM);
        long todayPresent = attendanceRecordRepository.countByDateAndStatus(LocalDate.now(), AttendanceStatus.PRESENT);

        DashboardSummaryResponse response = DashboardSummaryResponse.builder()
                .totalNetSalaryPaid(totalPaid)
                .averageSalary(avgSalary)
                .activeEmployeesCount(activeEmp)
                .runningContractsCount(runningContracts)
                .pendingLeaveRequestsCount(pendingLeaves)
                .todayPresentCount(todayPresent)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/department-costs")
    public ResponseEntity<ApiResponse<List<DepartmentCostProjection>>> getDepartmentCosts(
            @RequestParam(required = false) LocalDate sinceDate
    ) {
        LocalDate queryDate = sinceDate != null ? sinceDate : LocalDate.now().minusMonths(6);
        List<DepartmentCostProjection> costs = dashboardQueryRepository.findDepartmentCostBreakdown(queryDate);
        return ResponseEntity.ok(ApiResponse.ok(costs));
    }

    @GetMapping("/monthly-trends")
    public ResponseEntity<ApiResponse<List<MonthlyPayrollTrendProjection>>> getMonthlyTrends(
            @RequestParam(required = false) LocalDate sinceDate
    ) {
        LocalDate queryDate = sinceDate != null ? sinceDate : LocalDate.now().minusMonths(12);
        List<MonthlyPayrollTrendProjection> trends = dashboardQueryRepository.findMonthlyPayrollTrends(queryDate);
        return ResponseEntity.ok(ApiResponse.ok(trends));
    }
}
