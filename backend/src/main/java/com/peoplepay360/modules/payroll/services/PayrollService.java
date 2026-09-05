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
import com.peoplepay360.modules.payroll.repositories.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayrollService {

    private final PayrunRepository payrunRepository;
    private final SalaryStructureRepository structureRepository;
    private final ContractRepository contractRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final SalaryCalculationEngine calculationEngine;
    private final PayrollValidationScanner validationScanner;

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

        payrun.getPayslips().clear();

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

            int workedDays = attendanceRepository.countWorkedDaysInPeriod(
                    contract.getEmployee().getId(),
                    payrun.getPeriodStart(),
                    payrun.getPeriodEnd()
            );

            Payslip payslip = calculationEngine.computePayslip(payrun, contract.getEmployee(), contract, structure, workedDays);
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

        return payrunRepository.save(payrun);
    }

    public List<PayrollWarning> validatePayrun(UUID payrunId) {
        Payrun payrun = payrunRepository.findWithPayslipsById(payrunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", payrunId));
        return validationScanner.scan(payrun.getPayslips());
    }

    @Transactional
    public Payrun markAsPaid(UUID payrunId) {
        Payrun payrun = payrunRepository.findWithPayslipsById(payrunId)
                .orElseThrow(() -> new ResourceNotFoundException("Payrun", "id", payrunId));

        if (payrun.getStatus() != PayrunStatus.COMPUTED && payrun.getStatus() != PayrunStatus.VALIDATED) {
            throw new BusinessRuleViolationException("Only computed or validated payruns can be marked as paid");
        }

        payrun.setStatus(PayrunStatus.PAID);
        payrun.setPaidAt(Instant.now());

        for (Payslip payslip : payrun.getPayslips()) {
            payslip.setStatus(PayslipStatus.PAID);
        }

        return payrunRepository.save(payrun);
    }
}
