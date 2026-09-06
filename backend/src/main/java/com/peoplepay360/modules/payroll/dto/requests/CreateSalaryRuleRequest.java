package com.peoplepay360.modules.payroll.dto.requests;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
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
    @jakarta.validation.constraints.Size(min = 2, max = 100, message = "Rule name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Rule code is required")
    @jakarta.validation.constraints.Size(min = 2, max = 30, message = "Rule code must be between 2 and 30 characters")
    private String code;

    @NotNull(message = "Category is required")
    private SalaryRuleCategory category;

    @NotNull(message = "Sequence order is required")
    @Min(value = 1, message = "Sequence order must be at least 1")
    private Integer sequence;

    @NotNull(message = "Computation type is required")
    private ComputationType computationType;

    @DecimalMin(value = "0.0", message = "Fixed amount cannot be negative")
    private BigDecimal fixedAmount;

    @DecimalMin(value = "0.0", message = "Percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Percentage cannot exceed 100%")
    private BigDecimal percentage;

    @jakarta.validation.constraints.Size(max = 30, message = "Percentage base code cannot exceed 30 characters")
    private String percentageBaseCode;

    @jakarta.validation.constraints.Size(max = 500, message = "Formula cannot exceed 500 characters")
    private String formula;
}
