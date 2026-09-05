package com.peoplepay360.modules.contract.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.contract.dto.requests.CreateContractRequest;
import com.peoplepay360.modules.contract.dto.responses.ContractResponse;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.contract.services.ContractService;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.payroll.repositories.SalaryStructureRepository;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.repositories.WorkingScheduleRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final com.peoplepay360.modules.contract.repositories.ContractRepository contractRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository structureRepository;
    private final WorkingScheduleRepository scheduleRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(
            @RequestParam(required = false) UUID employeeId
    ) {
        List<Contract> contracts = employeeId != null
                ? contractService.getContractsByEmployee(employeeId)
                : contractRepository.findAll();
        List<ContractResponse> responses = contracts.stream().map(ContractResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getContractsByEmployee(
            @PathVariable UUID employeeId
    ) {
        List<Contract> contracts = contractService.getContractsByEmployee(employeeId);
        List<ContractResponse> responses = contracts.stream().map(ContractResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable UUID id) {
        Contract contract = contractService.getContractById(id);
        return ResponseEntity.ok(ApiResponse.ok(ContractResponse.from(contract)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> createContract(
            @Valid @RequestBody CreateContractRequest request
    ) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        SalaryStructure structure = structureRepository.findById(request.getSalaryStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure", "id", request.getSalaryStructureId()));

        UUID scheduleId = request.getWorkingScheduleId() != null
                ? request.getWorkingScheduleId()
                : (employee.getWorkingSchedule() != null ? employee.getWorkingSchedule().getId() : null);

        WorkingSchedule schedule = scheduleId != null
                ? scheduleRepository.findById(scheduleId).orElse(null)
                : scheduleRepository.findAll().stream().findFirst().orElse(null);

        String dept = request.getDepartment() != null && !request.getDepartment().isBlank()
                ? request.getDepartment()
                : employee.getDepartment();

        String position = request.getJobPosition() != null && !request.getJobPosition().isBlank()
                ? request.getJobPosition()
                : employee.getJobPosition();

        Contract contract = Contract.builder()
                .reference(request.getReference())
                .employee(employee)
                .department(dept)
                .jobPosition(position)
                .salaryStructure(structure)
                .workingSchedule(schedule)
                .wage(request.getWage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : com.peoplepay360.common.enums.ContractStatus.RUNNING)
                .build();

        Contract saved = contractService.saveContract(contract);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Contract created successfully", ContractResponse.from(saved)));
    }

    @PutMapping("/{id}/terminate")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ContractResponse>> terminateContract(
            @PathVariable UUID id,
            @RequestParam LocalDate terminationDate
    ) {
        Contract terminated = contractService.terminateContract(id, terminationDate);
        return ResponseEntity.ok(ApiResponse.ok("Contract terminated successfully", ContractResponse.from(terminated)));
    }
}
