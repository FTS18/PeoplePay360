package com.peoplepay360.modules.payroll.dto.responses;

import com.peoplepay360.common.enums.PayrunStatus;
import com.peoplepay360.modules.payroll.entities.Payrun;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrunResponse {

    private UUID id;
    private String name;
    private UUID salaryStructureId;
    private String salaryStructureName;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private PayrunStatus status;
    private BigDecimal totalBasic;
    private BigDecimal totalAllowances;
    private BigDecimal totalDeductions;
    private BigDecimal totalNet;
    private Integer payslipsCount;
    private Instant validatedAt;
    private Instant paidAt;

    public static PayrunResponse from(Payrun payrun) {
        return PayrunResponse.builder()
                .id(payrun.getId())
                .name(payrun.getName())
                .salaryStructureId(payrun.getSalaryStructure().getId())
                .salaryStructureName(payrun.getSalaryStructure().getName())
                .periodStart(payrun.getPeriodStart())
                .periodEnd(payrun.getPeriodEnd())
                .status(payrun.getStatus())
                .totalBasic(payrun.getTotalBasic())
                .totalAllowances(payrun.getTotalAllowances())
                .totalDeductions(payrun.getTotalDeductions())
                .totalNet(payrun.getTotalNet())
                .payslipsCount(payrun.getPayslipsCount())
                .validatedAt(payrun.getValidatedAt())
                .paidAt(payrun.getPaidAt())
                .build();
    }
}
