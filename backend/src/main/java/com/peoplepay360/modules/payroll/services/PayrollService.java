package com.peoplepay360.modules.payroll.services;

import com.peoplepay360.common.enums.PayrunStatus;
import com.peoplepay360.common.enums.PayslipStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import com.peoplepay360.modules.payroll.engine.PayrollValidationScanner;
import com.peoplepay360.modules.payroll.engine.PayrollValidationScanner.PayrollWarning;
import com.peoplepay360.modules.payroll.engine.SalaryCalculationEngine;
import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.payroll.repositories.PayrunRepository;
import com.peoplepay360.modules.payroll.repositories.PayslipRepository;
import com.peoplepay360.modules.payroll.repositories.SalaryStructureRepository;
import com.peoplepay360.modules.timeoff.services.LeaveLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayrollService {

    // These two codes block disbursement — data errors that produce wrong pay.
    private static final Set<String> CRITICAL_CODES = Set.of("ZERO_OR_NEGATIVE_NET", "MISSING_BANK_ACCOUNT");

    private final PayrunRepository payrunRepository;
    private final PayslipRepository payslipRepository;
    private final SalaryStructureRepository structureRepository;
    private final ContractRepository contractRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final LeaveLedgerService leaveLedgerService;
    private final SalaryCalculationEngine calculationEngine;
    private final PayrollValidationScanner validationScanner;
    private final com.peoplepay360.modules.dashboard.repositories.DashboardQueryRepository dashboardQueryRepository;

    @Transactional
    public Payrun createPayrunDraft(String name, UUID structureId, LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw new BusinessRuleViolationException("Period end date cannot precede start date");
        }

        boolean hasOverlap = payrunRepository.existsOverlappingPayrun(structureId, null, start, end);
        if (hasOverlap) {
            throw new BusinessRuleViolationException("A payrun already exists for this structure and period");
        }

        SalaryStructure structure = structureRepository.findById(structureId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", structureId));

        Payrun payrun = Payrun.builder()
                .name(name)
                .salaryStructure(structure)
                .periodStart(start)
                .periodEnd(end)
                .status(PayrunStatus.DRAFT)
                .build();

        return payrunRepository.save(payrun);
    }

    @Transactional
    public Payrun computeBatch(UUID payrunId, List<UUID> employeeIds) {
        Payrun payrun = payrunRepository.findWithPayslipsById(payrunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", payrunId));

        if (payrun.getStatus() == PayrunStatus.PAID) {
            throw new BusinessRuleViolationException("Finalized and paid payruns cannot be recomputed");
        }

        if (payrun.getPayslips() != null && !payrun.getPayslips().isEmpty()) {
            payslipRepository.deleteAll(payrun.getPayslips());
            payrun.getPayslips().clear();
        }

        SalaryStructure structure = structureRepository.findWithActiveRulesById(payrun.getSalaryStructure().getId())
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", payrun.getSalaryStructure().getId()));

        List<Contract> activeContracts = contractRepository.findActiveContractsInPeriod(
                payrun.getPeriodStart(),
                payrun.getPeriodEnd()
        );

        BigDecimal totalBasic = BigDecimal.ZERO;
        BigDecimal totalAllowances = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (Contract contract : activeContracts) {
            if (employeeIds != null && !employeeIds.isEmpty() && !employeeIds.contains(contract.getEmployee().getId())) {
                continue;
            }

            int rawWorkedDays = attendanceRepository.countWorkedDaysInPeriod(
                    contract.getEmployee().getId(),
                    payrun.getPeriodStart(),
                    payrun.getPeriodEnd()
            );

            int unpaidLeaveDays = leaveLedgerService.calculateClippedLeaveDays(
                    contract.getEmployee().getId(),
                    payrun.getPeriodStart(),
                    payrun.getPeriodEnd(),
                    false
            );

            int paidLeaveDays = leaveLedgerService.calculateClippedLeaveDays(
                    contract.getEmployee().getId(),
                    payrun.getPeriodStart(),
                    payrun.getPeriodEnd(),
                    true
            );

            int effectiveWorkedDays = rawWorkedDays + paidLeaveDays;

            Payslip payslip = calculationEngine.computePayslip(
                    payrun,
                    contract.getEmployee(),
                    contract,
                    structure,
                    effectiveWorkedDays,
                    unpaidLeaveDays,
                    paidLeaveDays
            );
            payrun.addPayslip(payslip);

            totalBasic = totalBasic.add(payslip.getBasicWage());
            totalAllowances = totalAllowances.add(payslip.getTotalAllowances());
            totalDeductions = totalDeductions.add(payslip.getTotalDeductions());
            totalNet = totalNet.add(payslip.getNetSalary());
        }

        payrun.setTotalBasic(totalBasic);
        payrun.setTotalAllowances(totalAllowances);
        payrun.setTotalDeductions(totalDeductions);
        payrun.setTotalNet(totalNet);
        payrun.setPayslipsCount(payrun.getPayslips().size());
        payrun.setStatus(PayrunStatus.COMPUTED);

        payrunRepository.saveAndFlush(payrun);
        payslipRepository.saveAllAndFlush(payrun.getPayslips());
        return payrun;
    }

    @Transactional
    public List<PayrollWarning> validatePayrun(UUID payrunId) {
        Payrun payrun = payrunRepository.findWithPayslipsById(payrunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", payrunId));

        if (payrun.getStatus() == PayrunStatus.PAID) {
            throw new BusinessRuleViolationException("Payrun is already finalized and paid");
        }

        List<PayrollWarning> warnings = validationScanner.scan(payrun.getPayslips());

        boolean hasCritical = warnings.stream().anyMatch(w -> CRITICAL_CODES.contains(w.warningCode()));
        if (!hasCritical) {
            // Clean scan — advance to VALIDATED so markAsPaid knows the officer reviewed it.
            payrun.setStatus(PayrunStatus.VALIDATED);
            payrunRepository.save(payrun);
        }

        return warnings;
    }

    @Transactional
    public Payrun markAsPaid(UUID payrunId) {
        Payrun payrun = payrunRepository.findWithPayslipsById(payrunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", payrunId));

        if (payrun.getStatus() != PayrunStatus.COMPUTED && payrun.getStatus() != PayrunStatus.VALIDATED) {
            throw new BusinessRuleViolationException("Only computed or validated payruns can be marked as paid");
        }

        // Re-run the scanner every time to catch data that changed after compute.
        List<PayrollWarning> warnings = validationScanner.scan(payrun.getPayslips());
        List<String> blockers = warnings.stream()
                .filter(w -> CRITICAL_CODES.contains(w.warningCode()))
                .map(w -> w.employeeName() + ": " + w.message())
                .toList();

        if (!blockers.isEmpty()) {
            throw new BusinessRuleViolationException(
                    "Payrun has critical validation failures and cannot be disbursed: " + String.join("; ", blockers)
            );
        }

        payrun.setStatus(PayrunStatus.PAID);
        payrun.setPaidAt(Instant.now());

        for (Payslip payslip : payrun.getPayslips()) {
            payslip.setStatus(PayslipStatus.PAID);
        }

        Payrun saved = payrunRepository.save(payrun);

        // Concurrently refresh Enterprise PostgreSQL Materialized Views for sub-10ms dashboard scaling
        try {
            dashboardQueryRepository.refreshDepartmentCostView();
            dashboardQueryRepository.refreshMonthlySummaryView();
        } catch (Exception e) {
            // Materialized views will catch up on next refresh if concurrent lock or migration in flight
        }

        return saved;
    }
}
