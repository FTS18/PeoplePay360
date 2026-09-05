package com.peoplepay360.modules.payroll.dto.responses;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryRuleResponse {

    private UUID id;
    private String name;
    private String code;
    private SalaryRuleCategory category;
    private Integer sequence;
    private ComputationType computationType;
    private BigDecimal fixedAmount;
    private BigDecimal percentage;
    private String percentageBaseCode;
    private String formula;
    private boolean active;

    public static SalaryRuleResponse from(SalaryRule rule) {
        return SalaryRuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .code(rule.getCode())
                .category(rule.getCategory())
                .sequence(rule.getSequence())
                .computationType(rule.getComputationType())
                .fixedAmount(rule.getFixedAmount())
                .percentage(rule.getPercentage())
                .percentageBaseCode(rule.getPercentageBaseCode())
                .formula(rule.getFormula())
                .active(rule.isActive())
                .build();
    }
}
