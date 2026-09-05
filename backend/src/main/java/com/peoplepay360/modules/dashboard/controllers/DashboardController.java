package com.peoplepay360.modules.dashboard.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.enums.Role;
import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.common.enums.PayslipStatus;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import com.peoplepay360.modules.dashboard.dto.responses.DashboardSummaryResponse;
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository;
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository.DepartmentCostProjection;
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository.MonthlyPayrollTrendProjection;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.payroll.repositories.PayslipRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffRequestRepository;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardQueryRepository dashboardQueryRepository;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final TimeOffRequestRepository timeOffRequestRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PayslipRepository payslipRepository;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentCostDto implements Serializable {
        private String department;
        private Long headcount;
        private BigDecimal totalGross;
        private BigDecimal totalNet;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyPayrollTrendDto implements Serializable {
        private LocalDate periodStart;
        private Long payslipCount;
        private BigDecimal totalGross;
        private BigDecimal totalNet;
    }

    @Cacheable(value = "dashboardSummary", key = "(#sinceDate != null ? #sinceDate.toString() : 'default') + '-' + (#department != null ? #department : 'ALL') + '-' + (#role != null ? #role.name() : 'ALL')")
    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> getSummary(
            @RequestParam(required = false) LocalDate sinceDate,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Role role
    ) {
        LocalDate queryDate = sinceDate != null ? sinceDate : LocalDate.now().minusMonths(12);

        BigDecimal totalPaid = dashboardQueryRepository.sumTotalNetSalaryPaid(queryDate, department, role);
        if (totalPaid == null || totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            totalPaid = dashboardQueryRepository.sumTotalNetSalaryPaid(LocalDate.of(2020, 1, 1), department, role);
        }
        BigDecimal avgSalary = dashboardQueryRepository.calculateAverageNetSalary(queryDate, department, role);
        if (avgSalary == null || avgSalary.compareTo(BigDecimal.ZERO) == 0) {
            avgSalary = dashboardQueryRepository.calculateAverageNetSalary(LocalDate.of(2020, 1, 1), department, role);
        }
        long activeEmp = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long runningContracts = contractRepository.countByStatus(ContractStatus.RUNNING);
        long pendingLeaves = timeOffRequestRepository.countByStatus(TimeOffStatus.CONFIRM);
        long approvedLeaves = timeOffRequestRepository.countByStatus(TimeOffStatus.APPROVED);
        long refusedLeaves = timeOffRequestRepository.countByStatus(TimeOffStatus.REFUSED);

        long presentCount = attendanceRecordRepository.countByStatus(AttendanceStatus.PRESENT);
        long lateCount = attendanceRecordRepository.countByStatus(AttendanceStatus.LATE);
        long absentCount = attendanceRecordRepository.countByStatus(AttendanceStatus.ABSENT);
        long overtimeCount = attendanceRecordRepository.countByStatus(AttendanceStatus.EXCEPTION);
        long manualEdits = attendanceRecordRepository.countByManualOverride(true);
        long missingCheckIns = Math.max(0, activeEmp - (presentCount + lateCount));

        long totalPayslips = payslipRepository.count();
        long draftPs = payslipRepository.countByStatus(PayslipStatus.DRAFT);
        long computedPs = payslipRepository.countByStatus(PayslipStatus.COMPUTED);
        long validatedPs = payslipRepository.countByStatus(PayslipStatus.VALIDATED);
        long paidPs = payslipRepository.countByStatus(PayslipStatus.PAID);

        long totalAttendanceRecords = attendanceRecordRepository.count();
        long presentAttendanceRecords = presentCount + lateCount;

        double healthRatio = totalAttendanceRecords > 0
                ? Math.min(100.0, Math.round(((double) presentAttendanceRecords / totalAttendanceRecords) * 1000.0) / 10.0)
                : 94.0;

        List<DashboardSummaryResponse.PayrollWarningDto> warnings = new ArrayList<>();
        
        List<Employee> allEmployees = employeeRepository.findAll();
        long missingBankCount = allEmployees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE && (e.getBankAccountNumber() == null || e.getBankAccountNumber().isBlank()))
                .count();
        if (missingBankCount > 0) {
            warnings.add(DashboardSummaryResponse.PayrollWarningDto.builder()
                    .id("WARN-BANK-AC")
                    .title("Missing Bank Account Details")
                    .description(missingBankCount + " employee(s) missing bank account details")
                    .category("MISSING_ACCOUNT")
                    .severity("HIGH")
                    .link("/employees")
                    .build());
        }

        if (activeEmp > runningContracts) {
            long diff = activeEmp - runningContracts;
            warnings.add(DashboardSummaryResponse.PayrollWarningDto.builder()
                    .id("WARN-NO-CONTRACT")
                    .title("Unassigned Active Contracts")
                    .description(diff + " contract(s) expiring or missing this month")
                    .category("NO_CONTRACT")
                    .severity("HIGH")
                    .link("/contracts")
                    .build());
        }

        if (draftPs > 0 || computedPs > 0) {
            warnings.add(DashboardSummaryResponse.PayrollWarningDto.builder()
                    .id("WARN-UNFINALIZED-PAYSLIPS")
                    .title("Unfinalized Payslips Pending Validation")
                    .description((draftPs + computedPs) + " drafts still not validated")
                    .category("PAYSLIP_DRAFT")
                    .severity("MEDIUM")
                    .link("/payroll/payruns")
                    .build());
        }

        DashboardSummaryResponse response = DashboardSummaryResponse.builder()
                .totalNetSalaryPaid(totalPaid)
                .averageSalary(avgSalary)
                .activeEmployeesCount(activeEmp)
                .runningContractsCount(runningContracts)
                .pendingLeaveRequestsCount(pendingLeaves)
                .refusedLeaveRequestsCount(refusedLeaves)
                .todayPresentCount(presentCount)
                .todayLateCount(lateCount)
                .todayAbsentCount(absentCount)
                .todayOvertimeCount(overtimeCount)
                .todayMissingCheckInsCount(missingCheckIns)
                .manualAttendanceEditsCount(manualEdits)
                .payslipsGenerated(totalPayslips)
                .approvedTimeOffDays(approvedLeaves)
                .attendanceHealthRatio(healthRatio)
                .draftPayslipsCount(draftPs)
                .computedPayslipsCount(computedPs)
                .validatedPayslipsCount(validatedPs)
                .paidPayslipsCount(paidPs)
                .payrollWarningsCount(warnings.size())
                .payrollWarnings(warnings)
                .build();

        return ApiResponse.ok(response);
    }

    @Cacheable(value = "departmentCosts", key = "(#sinceDate != null ? #sinceDate.toString() : 'default') + '-' + (#department != null ? #department : 'ALL') + '-' + (#role != null ? #role.name() : 'ALL')")
    @GetMapping("/department-costs")
    public ApiResponse<List<DepartmentCostDto>> getDepartmentCosts(
            @RequestParam(required = false) LocalDate sinceDate,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Role role
    ) {
        LocalDate queryDate = sinceDate != null ? sinceDate : LocalDate.now().minusMonths(12);
        List<DepartmentCostProjection> projections = dashboardQueryRepository.findDepartmentCostBreakdown(queryDate, department, role);
        if (projections == null || projections.isEmpty()) {
            projections = dashboardQueryRepository.findDepartmentCostBreakdown(LocalDate.of(2020, 1, 1), department, role);
        }
        
        List<DepartmentCostDto> costs = projections.stream()
                .map(p -> DepartmentCostDto.builder()
                        .department(p.getDepartment())
                        .headcount(p.getHeadcount())
                        .totalGross(p.getTotalGross())
                        .totalNet(p.getTotalNet())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.ok(costs);
    }

    @Cacheable(value = "monthlyTrends", key = "(#sinceDate != null ? #sinceDate.toString() : 'default') + '-' + (#department != null ? #department : 'ALL') + '-' + (#role != null ? #role.name() : 'ALL')")
    @GetMapping("/monthly-trends")
    public ApiResponse<List<MonthlyPayrollTrendDto>> getMonthlyTrends(
            @RequestParam(required = false) LocalDate sinceDate,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Role role
    ) {
        LocalDate queryDate = sinceDate != null ? sinceDate : LocalDate.now().minusMonths(12);
        List<MonthlyPayrollTrendProjection> projections = dashboardQueryRepository.findMonthlyPayrollTrends(queryDate, department, role);
        if (projections == null || projections.isEmpty()) {
            projections = dashboardQueryRepository.findMonthlyPayrollTrends(LocalDate.of(2020, 1, 1), department, role);
        }

        List<MonthlyPayrollTrendDto> trends = projections.stream()
                .map(p -> MonthlyPayrollTrendDto.builder()
                        .periodStart(p.getPeriodStart())
                        .payslipCount(p.getPayslipCount())
                        .totalGross(p.getTotalGross())
                        .totalNet(p.getTotalNet())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.ok(trends);
    }
}
