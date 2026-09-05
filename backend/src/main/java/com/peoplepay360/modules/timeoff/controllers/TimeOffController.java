package com.peoplepay360.modules.timeoff.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
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

    @GetMapping("/balances")
    public ResponseEntity<ApiResponse<List<TimeOffBalanceResponse>>> getBalances(
            @RequestParam UUID employeeId,
            @RequestParam(required = false) LocalDate asOfDate
    ) {
        LocalDate queryDate = asOfDate != null ? asOfDate : LocalDate.now();
        List<TimeOffType> types = typeRepository.findByActiveTrue();

        List<TimeOffBalanceResponse> balances = types.stream().map(type -> {
            BigDecimal bal = type.isRequiresAllocation()
                    ? leaveLedgerService.getAvailableBalance(employeeId, type.getId(), queryDate)
                    : BigDecimal.valueOf(999);

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
    public ResponseEntity<ApiResponse<PageResponse<TimeOffRequestResponse>>> getRequests(
            @RequestParam(required = false) UUID employeeId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<TimeOffRequest> page = employeeId != null
                ? requestRepository.findByEmployeeIdOrderByStartDateDesc(employeeId, pageable)
                : requestRepository.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(TimeOffRequestResponse::from))));
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<TimeOffRequestResponse>> applyLeave(
            @Valid @RequestBody CreateTimeOffRequestDto dto
    ) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", dto.getEmployeeId()));

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
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Leave request submitted", TimeOffRequestResponse.from(applied)));
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
