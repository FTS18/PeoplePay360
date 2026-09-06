package com.peoplepay360.modules.payroll.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.exception.BusinessRuleViolationException;
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

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
        String code = request.getCode().trim().toUpperCase();
        if (structureRepository.existsByCode(code)) {
            throw new BusinessRuleViolationException("A salary structure with code '" + code + "' already exists");
        }

        SalaryStructure structure = SalaryStructure.builder()
                .name(request.getName().trim())
                .code(code)
                .description(request.getDescription())
                .build();

        if (request.getRules() != null) {
            Set<String> ruleCodes = new HashSet<>();
            for (CreateSalaryRuleRequest r : request.getRules()) {
                String rCode = r.getCode().trim().toUpperCase();
                if (!ruleCodes.add(rCode)) {
                    throw new BusinessRuleViolationException("Duplicate rule code '" + rCode + "' in salary structure rules");
                }
                validateSalaryRule(r);
                SalaryRule rule = SalaryRule.builder()
                        .name(r.getName().trim())
                        .code(rCode)
                        .category(r.getCategory())
                        .sequence(r.getSequence())
                        .computationType(r.getComputationType())
                        .fixedAmount(r.getFixedAmount())
                        .percentage(r.getPercentage())
                        .percentageBaseCode(r.getPercentageBaseCode() != null ? r.getPercentageBaseCode().trim().toUpperCase() : null)
                        .formula(r.getFormula())
                        .build();
                structure.addRule(rule);
            }
        }

        SalaryStructure saved = structureRepository.save(structure);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Salary structure created", SalaryStructureResponse.from(saved)));
    }

    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SalaryStructureResponse>> updateStructure(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSalaryStructureRequest request
    ) {
        SalaryStructure structure = structureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));

        String code = request.getCode().trim().toUpperCase();
        if (!code.equalsIgnoreCase(structure.getCode()) && structureRepository.existsByCode(code)) {
            throw new BusinessRuleViolationException("A salary structure with code '" + code + "' already exists");
        }

        structure.setName(request.getName().trim());
        structure.setCode(code);
        structure.setDescription(request.getDescription());

        SalaryStructure saved = structureRepository.save(structure);
        return ResponseEntity.ok(ApiResponse.ok("Salary structure updated", SalaryStructureResponse.from(saved)));
    }

    @PostMapping("/{id}/rules")
    @Transactional
    @PreAuthorize("hasAnyRole('HR_PAYROLL_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SalaryRuleResponse>> addRule(
            @PathVariable UUID id,
            @Valid @RequestBody CreateSalaryRuleRequest request
    ) {
        validateSalaryRule(request);
        SalaryStructure structure = structureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", id));

        String rCode = request.getCode().trim().toUpperCase();
        boolean exists = structure.getRules().stream()
                .anyMatch(r -> r.getCode().equalsIgnoreCase(rCode));
        if (exists) {
            throw new BusinessRuleViolationException("A rule with code '" + rCode + "' already exists in this salary structure");
        }

        SalaryRule rule = SalaryRule.builder()
                .name(request.getName().trim())
                .code(rCode)
                .category(request.getCategory())
                .sequence(request.getSequence())
                .computationType(request.getComputationType())
                .fixedAmount(request.getFixedAmount())
                .percentage(request.getPercentage())
                .percentageBaseCode(request.getPercentageBaseCode() != null ? request.getPercentageBaseCode().trim().toUpperCase() : null)
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
        validateSalaryRule(request);
        SalaryRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("SalaryRule", "id", ruleId));

        String rCode = request.getCode().trim().toUpperCase();
        SalaryStructure structure = rule.getSalaryStructure();
        if (structure != null && structure.getRules() != null) {
            boolean duplicate = structure.getRules().stream()
                    .anyMatch(r -> !r.getId().equals(ruleId) && r.getCode().equalsIgnoreCase(rCode));
            if (duplicate) {
                throw new BusinessRuleViolationException("A rule with code '" + rCode + "' already exists in this salary structure");
            }
        }

        rule.setName(request.getName().trim());
        rule.setCode(rCode);
        rule.setCategory(request.getCategory());
        rule.setSequence(request.getSequence());
        rule.setComputationType(request.getComputationType());
        rule.setFixedAmount(request.getFixedAmount());
        rule.setPercentage(request.getPercentage());
        rule.setPercentageBaseCode(request.getPercentageBaseCode() != null ? request.getPercentageBaseCode().trim().toUpperCase() : null);
        rule.setFormula(request.getFormula());

        SalaryRule saved = ruleRepository.save(rule);
        return ResponseEntity.ok(ApiResponse.ok("Salary rule updated", SalaryRuleResponse.from(saved)));
    }

    private void validateSalaryRule(CreateSalaryRuleRequest r) {
        if (r.getComputationType() == com.peoplepay360.common.enums.ComputationType.FIXED) {
            if (r.getFixedAmount() == null || r.getFixedAmount().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new com.peoplepay360.exception.BusinessRuleViolationException(
                        "Fixed amount is required and cannot be negative for FIXED computation rule: " + r.getCode());
            }
        } else if (r.getComputationType() == com.peoplepay360.common.enums.ComputationType.PERCENTAGE) {
            if (r.getPercentage() == null || r.getPercentage().compareTo(java.math.BigDecimal.ZERO) < 0
                    || r.getPercentage().compareTo(java.math.BigDecimal.valueOf(100)) > 0) {
                throw new com.peoplepay360.exception.BusinessRuleViolationException(
                        "Percentage must be between 0 and 100 for PERCENTAGE computation rule: " + r.getCode());
            }
            if (r.getPercentageBaseCode() == null || r.getPercentageBaseCode().isBlank()) {
                throw new com.peoplepay360.exception.BusinessRuleViolationException(
                        "Percentage base code is required for rule: " + r.getCode());
            }
        } else if (r.getComputationType() == com.peoplepay360.common.enums.ComputationType.FORMULA) {
            if (r.getFormula() == null || r.getFormula().isBlank()) {
                throw new com.peoplepay360.exception.BusinessRuleViolationException(
                        "Formula expression is required for FORMULA computation rule: " + r.getCode());
            }
        }
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
