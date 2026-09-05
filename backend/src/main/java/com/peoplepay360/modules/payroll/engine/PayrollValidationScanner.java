package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.timeoff.repositories.TimeOffRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PayrollValidationScanner {

    private final TimeOffRequestRepository timeOffRequestRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public record PayrollWarning(UUID employeeId, String employeeName, String warningCode, String message) {}

    public List<PayrollWarning> scan(List<Payslip> payslips) {
        List<PayrollWarning> warnings = new ArrayList<>();
        Set<UUID> seenEmployees = new HashSet<>();

        for (Payslip payslip : payslips) {
            UUID empId = payslip.getEmployee().getId();
            String empName = payslip.getEmployee().getFullName();

            if (!seenEmployees.add(empId)) {
                warnings.add(new PayrollWarning(empId, empName, "DUPLICATE_PAYSLIP", "Duplicate payslip detected for employee in this batch"));
            }

            if (payslip.getEmployee().getBankAccountNumber() == null || payslip.getEmployee().getBankAccountNumber().isBlank()) {
                warnings.add(new PayrollWarning(empId, empName, "MISSING_BANK_ACCOUNT", "Employee has no bank account number on file"));
            }

            if (payslip.getEmployee().getBankIdentifierCode() == null || payslip.getEmployee().getBankIdentifierCode().isBlank()) {
                warnings.add(new PayrollWarning(empId, empName, "MISSING_BANK_IDENTIFIER", "Employee has no bank identifier/routing code on file"));
            }

            if (payslip.getEmployee().getIdentificationNumber() == null || payslip.getEmployee().getIdentificationNumber().isBlank()) {
                warnings.add(new PayrollWarning(empId, empName, "MISSING_TAX_ID", "Employee has no Tax ID / PAN / SSN identification number on file"));
            }

            if (payslip.getNetSalary() == null || payslip.getNetSalary().compareTo(BigDecimal.ZERO) <= 0) {
                warnings.add(new PayrollWarning(empId, empName, "ZERO_OR_NEGATIVE_NET", "Computed net salary is zero or negative"));
            }

            if (payslip.getContract().getEndDate() != null && payslip.getContract().getEndDate().isBefore(payslip.getPeriodEnd())) {
                warnings.add(new PayrollWarning(empId, empName, "CONTRACT_EXPIRING", "Employment contract expires before the payrun period end date"));
            }

            long pendingLeaves = timeOffRequestRepository.countPendingRequestsInWindow(empId, payslip.getPeriodStart(), payslip.getPeriodEnd());
            if (pendingLeaves > 0) {
                warnings.add(new PayrollWarning(empId, empName, "PENDING_LEAVE_REQUEST", "Employee has " + pendingLeaves + " unapproved pending leave request(s) within the pay period"));
            }

            long anomalies = attendanceRecordRepository.countAnomaliesForEmployeeInPeriod(empId, payslip.getPeriodStart(), payslip.getPeriodEnd());
            if (anomalies > 0) {
                warnings.add(new PayrollWarning(empId, empName, "UNRESOLVED_ATTENDANCE_ANOMALY", "Employee has " + anomalies + " unresolved attendance anomaly/anomalies (missing check-out or exception) in the period"));
            }
        }

        return warnings;
    }
}
