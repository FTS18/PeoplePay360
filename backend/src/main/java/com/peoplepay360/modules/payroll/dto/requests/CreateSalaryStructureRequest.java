package com.peoplepay360.modules.payroll.dto.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSalaryStructureRequest {

    @NotBlank(message = "Structure name is required")
    @jakarta.validation.constraints.Size(min = 3, max = 80, message = "Structure name must be between 3 and 80 characters")
    private String name;

    @NotBlank(message = "Structure code is required")
    @jakarta.validation.constraints.Size(min = 3, max = 20, message = "Structure code must be between 3 and 20 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[A-Z0-9_-]+$", message = "Structure code must contain uppercase letters, numbers, hyphens, or underscores")
    private String code;

    @jakarta.validation.constraints.Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    private List<@jakarta.validation.Valid CreateSalaryRuleRequest> rules;
}
