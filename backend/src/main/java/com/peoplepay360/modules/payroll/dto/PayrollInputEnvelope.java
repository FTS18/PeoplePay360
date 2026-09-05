package com.peoplepay360.modules.payroll.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * High-performance native projection envelope for batch payroll calculations.
 * Avoids hydrating thousands of managed JPA entities during massive payrun operations.
 */
public interface PayrollInputEnvelope {
    UUID getContractId();
    UUID getEmployeeId();
    UUID getSalaryStructureId();
    BigDecimal getBaseWage();
    BigDecimal getProrationRatio();
    BigDecimal getProratedBaseWage();
    BigDecimal getWorkedHours();
    BigDecimal getOvertimeHours();
    Integer getAuditFlagCount();
    Integer getPaidLeaveDays();
    Integer getUnpaidLeaveDays();
    Boolean getRequiresManualReview();
}
