package com.peoplepay360.modules.payroll.dto.requests;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSalaryRuleRequest {

    @NotBlank(message = "Rule name is required")
    private String name;

    @NotBlank(message = "Rule code is required")
    private String code;

    @NotNull(message = "Category is required")
    private SalaryRuleCategory category;

    @NotNull(message = "Sequence order is required")
    private Integer sequence;

    @NotNull(message = "Computation type is required")
    private ComputationType computationType;

    private BigDecimal fixedAmount;
    private BigDecimal percentage;
    private String percentageBaseCode;
    private String formula;
}
