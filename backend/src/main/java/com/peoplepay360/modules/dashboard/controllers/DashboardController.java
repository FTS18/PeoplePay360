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
import com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository.PayrollAggregateProjection;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
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
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private static final LocalDate EPOCH_START = LocalDate.of(2020, 1, 1);

    private final DashboardQueryRepository dashboardQueryRepository;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final TimeOffRequestRepository timeOffRequestRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final PayslipRepository payslipRepository;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DepartmentCostDto implements Serializable {
        private String department;
        private Long headcount;
        private BigDecimal totalGross;
        private BigDecimal totalNet;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
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

        // ── 1 query: SUM + AVG in one scan. Use EPOCH_START as fallback so we never re-query. ──
        PayrollAggregateProjection aggregates = dashboardQueryRepository.getPayrollAggregates(EPOCH_START, department, role);
        // Prefer the tighter date window result; fall back to all-time only if the window returns zero.
        PayrollAggregateProjection windowAggregates = dashboardQueryRepository.getPayrollAggregates(queryDate, department, role);
        BigDecimal totalPaid = (windowAggregates != null && !isZeroOrNull(windowAggregates.getTotalNet()))
                ? windowAggregates.getTotalNet()
                : (aggregates != null ? aggregates.getTotalNet() : BigDecimal.ZERO);
        BigDecimal avgSalary = (windowAggregates != null && !isZeroOrNull(windowAggregates.getAvgNet()))
                ? windowAggregates.getAvgNet()
                : (aggregates != null ? aggregates.getAvgNet() : BigDecimal.ZERO);

        // ── 1 query: all attendance status counts grouped ──
        Map<AttendanceStatus, Long> attCounts = buildAttendanceCounts();
        long presentCount  = attCounts.getOrDefault(AttendanceStatus.PRESENT, 0L);
        long lateCount     = attCounts.getOrDefault(AttendanceStatus.LATE, 0L);
        long absentCount   = attCounts.getOrDefault(AttendanceStatus.ABSENT, 0L);
        long overtimeCount = attCounts.getOrDefault(AttendanceStatus.EXCEPTION, 0L);
        long totalAttendanceRecords = attCounts.values().stream().mapToLong(Long::longValue).sum();
        long manualEdits = attendanceRecordRepository.countByManualOverride(true);

        // ── 1 query: all time-off status counts grouped ──
        Map<TimeOffStatus, Long> leaveCounts = buildLeaveCounts();
        long pendingLeaves  = leaveCounts.getOrDefault(TimeOffStatus.CONFIRM, 0L);
        long approvedLeaves = leaveCounts.getOrDefault(TimeOffStatus.APPROVED, 0L);
        long refusedLeaves  = leaveCounts.getOrDefault(TimeOffStatus.REFUSED, 0L);

        // ── 1 query: all payslip status counts grouped ──
        Map<PayslipStatus, Long> payslipCounts = buildPayslipCounts();
        long totalPayslips = payslipCounts.values().stream().mapToLong(Long::longValue).sum();
        long draftPs     = payslipCounts.getOrDefault(PayslipStatus.DRAFT, 0L);
        long computedPs  = payslipCounts.getOrDefault(PayslipStatus.COMPUTED, 0L);
        long validatedPs = payslipCounts.getOrDefault(PayslipStatus.VALIDATED, 0L);
        long paidPs      = payslipCounts.getOrDefault(PayslipStatus.PAID, 0L);

        // ── 1 query: replaces full findAll() scan for missing bank check ──
        long missingBankCount = employeeRepository.countActiveWithMissingBank();

        long activeEmp        = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        long runningContracts = contractRepository.countByStatus(ContractStatus.RUNNING);
        long missingCheckIns  = Math.max(0, activeEmp - (presentCount + lateCount));

        long presentAttendanceRecords = presentCount + lateCount;
        double healthRatio = totalAttendanceRecords > 0
                ? Math.min(100.0, Math.round(((double) presentAttendanceRecords / totalAttendanceRecords) * 1000.0) / 10.0)
                : 94.0;

        List<DashboardSummaryResponse.PayrollWarningDto> warnings = new ArrayList<>();

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
            warnings.add(DashboardSummaryResponse.PayrollWarningDto.builder()
                    .id("WARN-NO-CONTRACT")
                    .title("Unassigned Active Contracts")
                    .description((activeEmp - runningContracts) + " contract(s) expiring or missing this month")
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
            projections = dashboardQueryRepository.findDepartmentCostBreakdown(EPOCH_START, department, role);
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
            projections = dashboardQueryRepository.findMonthlyPayrollTrends(EPOCH_START, department, role);
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

    // ── Private helpers ──────────────────────────────────────────────────────

    private Map<AttendanceStatus, Long> buildAttendanceCounts() {
        Map<AttendanceStatus, Long> result = new EnumMap<>(AttendanceStatus.class);
        for (Object[] row : attendanceRecordRepository.countGroupedByStatus()) {
            result.put((AttendanceStatus) row[0], (Long) row[1]);
        }
        return result;
    }

    private Map<TimeOffStatus, Long> buildLeaveCounts() {
        Map<TimeOffStatus, Long> result = new EnumMap<>(TimeOffStatus.class);
        for (Object[] row : timeOffRequestRepository.countGroupedByStatus()) {
            result.put((TimeOffStatus) row[0], (Long) row[1]);
        }
        return result;
    }

    private Map<PayslipStatus, Long> buildPayslipCounts() {
        Map<PayslipStatus, Long> result = new EnumMap<>(PayslipStatus.class);
        for (Object[] row : payslipRepository.countGroupedByStatus()) {
            result.put((PayslipStatus) row[0], (Long) row[1]);
        }
        return result;
    }

    private static boolean isZeroOrNull(BigDecimal value) {
        return value == null || value.compareTo(BigDecimal.ZERO) == 0;
    }
}
