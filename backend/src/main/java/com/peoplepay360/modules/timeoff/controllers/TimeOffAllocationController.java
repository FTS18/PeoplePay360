package com.peoplepay360.modules.timeoff.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.timeoff.dto.requests.CreateAllocationRequest;
import com.peoplepay360.modules.timeoff.dto.responses.AllocationResponse;
import com.peoplepay360.modules.timeoff.entities.TimeOffAllocation;
import com.peoplepay360.modules.timeoff.entities.TimeOffType;
import com.peoplepay360.modules.timeoff.repositories.TimeOffAllocationRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffTypeRepository;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/timeoff/allocations")
@RequiredArgsConstructor
public class TimeOffAllocationController {

    private final TimeOffAllocationRepository allocationRepository;
    private final TimeOffTypeRepository typeRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<AllocationResponse>>> getAllocations(
            @RequestParam(required = false) UUID employeeId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        UUID resolvedId = isEmployee ? currentUser.getId() : employeeId;
        Page<TimeOffAllocation> page = resolvedId != null
                ? allocationRepository.findByEmployeeIdOrderByValidFromDesc(resolvedId, pageable)
                : allocationRepository.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(AllocationResponse::from))));
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AllocationResponse>> createAllocation(
            @Valid @RequestBody CreateAllocationRequest request
    ) {
        if (request.getValidTo().isBefore(request.getValidFrom())) {
            throw new BusinessRuleViolationException("Validity end date cannot precede valid from date");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        TimeOffType type = typeRepository.findById(request.getTimeOffTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "id", request.getTimeOffTypeId()));

        TimeOffAllocation allocation = TimeOffAllocation.builder()
                .employee(employee)
                .timeOffType(type)
                .allocatedUnits(request.getAllocatedUnits())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .status(TimeOffStatus.CONFIRM)
                .build();

        TimeOffAllocation saved = allocationRepository.save(allocation);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Time off allocation created", AllocationResponse.from(saved)));
    }

    @PutMapping("/{id}/approve")
    @Transactional
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AllocationResponse>> approveAllocation(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        TimeOffAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffAllocation", "id", id));

        Employee approver = employeeRepository.findById(currentUser.getId()).orElse(null);

        allocation.setStatus(TimeOffStatus.APPROVED);
        allocation.setApprover(approver);
        allocation.setApprovalDate(Instant.now());

        TimeOffAllocation saved = allocationRepository.save(allocation);
        return ResponseEntity.ok(ApiResponse.ok("Allocation approved and balance updated", AllocationResponse.from(saved)));
    }
}
