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
    private String name;

    @NotBlank(message = "Structure code is required")
    private String code;

    private String description;

    private List<CreateSalaryRuleRequest> rules;
}
