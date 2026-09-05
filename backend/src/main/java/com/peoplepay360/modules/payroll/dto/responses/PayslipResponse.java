package com.peoplepay360.modules.payroll.dto.responses;

import com.peoplepay360.common.enums.PayslipStatus;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.entities.PayslipLine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayslipResponse {

    private UUID id;
    private UUID payrunId;
    private String payrunName;
    private UUID employeeId;
    private String employeeName;
    private String employeeCode;
    private String department;
    private String jobPosition;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Integer workedDays;
    private BigDecimal basicWage;
    private BigDecimal grossSalary;
    private BigDecimal totalAllowances;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private PayslipStatus status;
    private boolean pdfGenerated;
    private boolean emailSent;
    private List<PayslipLineResponse> lines;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PayslipLineResponse {
        private String ruleCode;
        private String ruleName;
        private SalaryRuleCategory category;
        private Integer sequence;
        private BigDecimal rate;
        private BigDecimal amount;

        public static PayslipLineResponse from(PayslipLine line) {
            return PayslipLineResponse.builder()
                    .ruleCode(line.getRuleCode())
                    .ruleName(line.getRuleName())
                    .category(line.getCategory())
                    .sequence(line.getSequence())
                    .rate(line.getRate())
                    .amount(line.getAmount())
                    .build();
        }
    }

    public static PayslipResponse from(Payslip p) {
        List<PayslipLineResponse> lineDtos = p.getLines() != null
                ? p.getLines().stream().map(PayslipLineResponse::from).toList()
                : List.of();

        return PayslipResponse.builder()
                .id(p.getId())
                .payrunId(p.getPayrun().getId())
                .payrunName(p.getPayrun().getName())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFullName())
                .employeeCode(p.getEmployee().getEmployeeCode())
                .department(p.getEmployee().getDepartment())
                .jobPosition(p.getEmployee().getJobPosition())
                .periodStart(p.getPeriodStart())
                .periodEnd(p.getPeriodEnd())
                .workedDays(p.getWorkedDays())
                .basicWage(p.getBasicWage())
                .grossSalary(p.getGrossSalary())
                .totalAllowances(p.getTotalAllowances())
                .totalDeductions(p.getTotalDeductions())
                .netSalary(p.getNetSalary())
                .status(p.getStatus())
                .pdfGenerated(p.isPdfGenerated())
                .emailSent(p.isEmailSent())
                .lines(lineDtos)
                .build();
    }
}
