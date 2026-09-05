package com.peoplepay360.modules.employee.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.modules.employee.dto.requests.CreateEmployeeRequest;
import com.peoplepay360.modules.employee.dto.responses.EmployeeResponse;
import com.peoplepay360.modules.employee.services.EmployeeService;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) EmployeeStatus status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        PageResponse<EmployeeResponse> page = employeeService.getEmployees(search, department, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN') or #currentUser.id.toString() == #id.toString()")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(
            @PathVariable UUID id,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        EmployeeResponse employee = employeeService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.ok(employee));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
        List<String> departments = employeeService.getDepartments();
        return ResponseEntity.ok(ApiResponse.ok(departments));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        EmployeeResponse created = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Employee created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable UUID id,
            @RequestBody com.peoplepay360.modules.employee.dto.requests.UpdateEmployeeRequest request
    ) {
        EmployeeResponse updated = employeeService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Employee updated successfully", updated));
    }
}
