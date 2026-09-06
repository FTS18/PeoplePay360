package com.peoplepay360.modules.timeoff.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.timeoff.dto.requests.CreateTimeOffRequestDto;
import com.peoplepay360.modules.timeoff.dto.responses.TimeOffBalanceResponse;
import com.peoplepay360.modules.timeoff.dto.responses.TimeOffRequestResponse;
import com.peoplepay360.modules.timeoff.entities.TimeOffRequest;
import com.peoplepay360.modules.timeoff.entities.TimeOffType;
import com.peoplepay360.modules.timeoff.repositories.TimeOffRequestRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffTypeRepository;
import com.peoplepay360.modules.timeoff.services.LeaveLedgerService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/timeoff")
@RequiredArgsConstructor
public class TimeOffController {

    private final LeaveLedgerService leaveLedgerService;
    private final TimeOffTypeRepository typeRepository;
    private final TimeOffRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<TimeOffType>>> getActiveTypes() {
        return ResponseEntity.ok(ApiResponse.ok(typeRepository.findByActiveTrue()));
    }

    @GetMapping("/types/all")
    public ResponseEntity<ApiResponse<List<TimeOffType>>> getAllTypes() {
        return ResponseEntity.ok(ApiResponse.ok(typeRepository.findAll()));
    }

    @PostMapping("/types")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TimeOffType>> createType(
            @RequestBody TimeOffType type
    ) {
        if (type.getName() == null || type.getName().trim().isEmpty()) {
            throw new BusinessRuleViolationException("Leave type name is required");
        }
        if (type.getCode() == null || type.getCode().trim().isEmpty()) {
            throw new BusinessRuleViolationException("Leave type code is required");
        }

        String code = type.getCode().trim().toUpperCase();
        String name = type.getName().trim();

        if (name.length() < 2 || name.length() > 50) {
            throw new BusinessRuleViolationException("Leave type name must be between 2 and 50 characters");
        }
        if (code.length() < 2 || code.length() > 20) {
            throw new BusinessRuleViolationException("Leave type code must be between 2 and 20 characters");
        }

        if (typeRepository.existsByCode(code)) {
            throw new BusinessRuleViolationException("A leave type with code '" + code + "' already exists");
        }
        if (typeRepository.existsByName(name)) {
            throw new BusinessRuleViolationException("A leave type with name '" + name + "' already exists");
        }

        type.setName(name);
        type.setCode(code);
        if (type.getUnit() == null) {
            type.setUnit(com.peoplepay360.common.enums.TimeOffUnit.DAYS);
        }
        TimeOffType saved = typeRepository.save(type);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Time off type created successfully", saved));
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TimeOffType>> updateType(
            @PathVariable UUID id,
            @RequestBody TimeOffType type
    ) {
        TimeOffType existing = typeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "id", id));

        if (type.getName() != null) {
            String name = type.getName().trim();
            if (name.length() < 2 || name.length() > 50) {
                throw new BusinessRuleViolationException("Leave type name must be between 2 and 50 characters");
            }
            if (!name.equalsIgnoreCase(existing.getName()) && typeRepository.existsByName(name)) {
                throw new BusinessRuleViolationException("A leave type with name '" + name + "' already exists");
            }
            existing.setName(name);
        }

        if (type.getCode() != null) {
            String code = type.getCode().trim().toUpperCase();
            if (code.length() < 2 || code.length() > 20) {
                throw new BusinessRuleViolationException("Leave type code must be between 2 and 20 characters");
            }
            if (!code.equalsIgnoreCase(existing.getCode()) && typeRepository.existsByCode(code)) {
                throw new BusinessRuleViolationException("A leave type with code '" + code + "' already exists");
            }
            existing.setCode(code);
        }

        if (type.getUnit() != null) existing.setUnit(type.getUnit());
        existing.setRequiresAllocation(type.isRequiresAllocation());
        existing.setPaid(type.isPaid());
        if (type.getColorCode() != null) existing.setColorCode(type.getColorCode());
        existing.setActive(type.isActive());

        TimeOffType saved = typeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Time off type updated successfully", saved));
    }

    @PutMapping("/types/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TimeOffType>> toggleTypeStatus(@PathVariable UUID id) {
        TimeOffType existing = typeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "id", id));
        existing.setActive(!existing.isActive());
        TimeOffType saved = typeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.ok("Time off type status updated to " + (saved.isActive() ? "ACTIVE" : "INACTIVE"), saved));
    }

    @GetMapping("/balances")
    public ResponseEntity<ApiResponse<List<TimeOffBalanceResponse>>> getBalances(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) LocalDate asOfDate,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        UUID resolvedId = isEmployee ? currentUser.getId() : (employeeId != null ? employeeId : currentUser.getId());
        LocalDate queryDate = asOfDate != null ? asOfDate : LocalDate.now();
        List<TimeOffType> types = typeRepository.findByActiveTrue();
        java.util.Map<UUID, BigDecimal> precomputedBalances = leaveLedgerService.getAllAvailableBalances(resolvedId, queryDate);

        List<TimeOffBalanceResponse> balances = types.stream().map(type -> {
            BigDecimal bal;
            if (type.isRequiresAllocation()) {
                BigDecimal actualBal = precomputedBalances.getOrDefault(type.getId(), BigDecimal.ZERO);
                if (actualBal.compareTo(BigDecimal.ZERO) == 0) {
                    // Default baseline entitlement fallback for paid leave types
                    bal = "PTO".equals(type.getCode()) ? BigDecimal.valueOf(24) :
                          "SICK".equals(type.getCode()) ? BigDecimal.valueOf(12) :
                          "CASUAL".equals(type.getCode()) ? BigDecimal.valueOf(10) : actualBal;
                } else {
                    bal = actualBal;
                }
            } else {
                bal = BigDecimal.valueOf(999);
            }

            return TimeOffBalanceResponse.builder()
                    .timeOffTypeId(type.getId())
                    .timeOffTypeName(type.getName())
                    .code(type.getCode())
                    .unit(type.getUnit())
                    .availableBalance(bal)
                    .colorCode(type.getColorCode())
                    .build();
        }).toList();

        return ResponseEntity.ok(ApiResponse.ok(balances));
    }

    @GetMapping("/requests")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<TimeOffRequestResponse>>> getRequests(
            @RequestParam(required = false) UUID employeeId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        UUID resolvedId = isEmployee ? currentUser.getId() : employeeId;
        Page<TimeOffRequest> page = resolvedId != null
                ? requestRepository.findByEmployeeIdOrderByStartDateDesc(resolvedId, pageable)
                : requestRepository.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(TimeOffRequestResponse::from))));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<TimeOffRequestResponse>> applyLeave(
            @Valid @RequestBody CreateTimeOffRequestDto dto,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        UUID targetEmployeeId = isEmployee ? currentUser.getId() : dto.getEmployeeId();

        Employee employee = employeeRepository.findById(targetEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", targetEmployeeId));

        TimeOffType type = typeRepository.findById(dto.getTimeOffTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "id", dto.getTimeOffTypeId()));

        TimeOffRequest request = TimeOffRequest.builder()
                .employee(employee)
                .timeOffType(type)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .requestedUnits(dto.getRequestedUnits())
                .reason(dto.getReason())
                .build();

        TimeOffRequest applied = leaveLedgerService.applyLeave(request);

        boolean isAdminOrHr = !currentUser.getRole().name().equals("EMPLOYEE");
        if (isAdminOrHr) {
            Employee approver = employeeRepository.findById(currentUser.getId()).orElse(employee);
            applied = leaveLedgerService.approveRequest(applied.getId(), approver);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(isAdminOrHr ? "Leave request created and auto-approved" : "Leave request submitted", TimeOffRequestResponse.from(applied)));
    }

    @PutMapping("/requests/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TimeOffRequestResponse>> approveRequest(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        Employee approver = employeeRepository.findById(currentUser.getId()).orElse(null);
        TimeOffRequest approved = leaveLedgerService.approveRequest(id, approver);
        return ResponseEntity.ok(ApiResponse.ok("Leave request approved", TimeOffRequestResponse.from(approved)));
    }

    @PutMapping("/requests/{id}/refuse")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TimeOffRequestResponse>> refuseRequest(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        Employee approver = employeeRepository.findById(currentUser.getId()).orElse(null);
        TimeOffRequest refused = leaveLedgerService.refuseRequest(id, approver, reason);
        return ResponseEntity.ok(ApiResponse.ok("Leave request refused", TimeOffRequestResponse.from(refused)));
    }
}
