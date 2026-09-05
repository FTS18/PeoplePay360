package com.peoplepay360.modules.payroll.dto.responses;

import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructureResponse {

    private UUID id;
    private String name;
    private String code;
    private String description;
    private boolean active;
    private int rulesCount;
    private List<SalaryRuleResponse> rules;

    public static SalaryStructureResponse from(SalaryStructure structure) {
        List<SalaryRuleResponse> ruleResponses = structure.getRules() != null
                ? structure.getRules().stream().map(SalaryRuleResponse::from).toList()
                : List.of();

        return SalaryStructureResponse.builder()
                .id(structure.getId())
                .name(structure.getName())
                .code(structure.getCode())
                .description(structure.getDescription())
                .active(structure.isActive())
                .rulesCount(ruleResponses.size())
                .rules(ruleResponses)
                .build();
    }
}
