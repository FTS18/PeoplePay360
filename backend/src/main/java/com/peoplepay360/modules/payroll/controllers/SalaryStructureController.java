package com.peoplepay360.modules.payroll.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.payroll.dto.requests.CreateSalaryRuleRequest;
import com.peoplepay360.modules.payroll.dto.requests.CreateSalaryStructureRequest;
import com.peoplepay360.modules.payroll.dto.responses.SalaryRuleResponse;
import com.peoplepay360.modules.payroll.dto.responses.SalaryStructureResponse;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.payroll.repositories.SalaryRuleRepository;
import com.peoplepay360.modules.payroll.repositories.SalaryStructureRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payroll/structures")
@RequiredArgsConstructor
public class SalaryStructureController {

    private final SalaryStructureRepository structureRepository;
    private final SalaryRuleRepository ruleRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<SalaryStructureResponse>>> getAllStructures() {
        List<SalaryStructure> structures = structureRepository.findAllWithRules();
        List<SalaryStructureResponse> responses = structures.stream().map(SalaryStructureResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> getStructureById(@PathVariable UUID id) {
        SalaryStructure structure = structureRepository.findWithActiveRulesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));
        return ResponseEntity.ok(ApiResponse.ok(SalaryStructureResponse.from(structure)));
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> createStructure(
            @Valid @RequestBody CreateSalaryStructureRequest request
    ) {
        SalaryStructure structure = SalaryStructure.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .build();

        if (request.getRules() != null) {
            for (CreateSalaryRuleRequest r : request.getRules()) {
                SalaryRule rule = SalaryRule.builder()
                        .name(r.getName())
                        .code(r.getCode())
                        .category(r.getCategory())
                        .sequence(r.getSequence())
                        .computationType(r.getComputationType())
                        .fixedAmount(r.getFixedAmount())
                        .percentage(r.getPercentage())
                        .percentageBaseCode(r.getPercentageBaseCode())
                        .formula(r.getFormula())
                        .build();
                structure.addRule(rule);
            }
        }

        SalaryStructure saved = structureRepository.save(structure);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Salary structure created", SalaryStructureResponse.from(saved)));
    }

    @PostMapping("/{id}/rules")
    @Transactional
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SalaryRuleResponse>> addRule(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSalaryRuleRequest request
    ) {
        SalaryStructure structure = structureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));

        SalaryRule rule = SalaryRule.builder()
                .name(request.getName())
                .code(request.getCode())
                .category(request.getCategory())
                .sequence(request.getSequence())
                .computationType(request.getComputationType())
                .fixedAmount(request.getFixedAmount())
                .percentage(request.getPercentage())
                .percentageBaseCode(request.getPercentageBaseCode())
                .formula(request.getFormula())
                .build();

        structure.addRule(rule);
        SalaryRule saved = ruleRepository.save(rule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Salary rule added", SalaryRuleResponse.from(saved)));
    }

    @PutMapping("/rules/{ruleId}")
    @Transactional
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SalaryRuleResponse>> updateRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody CreateSalaryRuleRequest request
    ) {
        SalaryRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryRule", "id", ruleId));

        rule.setName(request.getName());
        rule.setCode(request.getCode());
        rule.setCategory(request.getCategory());
        rule.setSequence(request.getSequence());
        rule.setComputationType(request.getComputationType());
        rule.setFixedAmount(request.getFixedAmount());
        rule.setPercentage(request.getPercentage());
        rule.setPercentageBaseCode(request.getPercentageBaseCode());
        rule.setFormula(request.getFormula());

        SalaryRule saved = ruleRepository.save(rule);
        return ResponseEntity.ok(ApiResponse.ok("Salary rule updated", SalaryRuleResponse.from(saved)));
    }

    @DeleteMapping("/rules/{ruleId}")
    @Transactional
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID ruleId) {
        SalaryRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryRule", "id", ruleId));
        ruleRepository.delete(rule);
        return ResponseEntity.ok(ApiResponse.ok("Salary rule deleted", null));
    }
}
