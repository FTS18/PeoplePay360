package com.peoplepay360.modules.employee.services;

import com.peoplepay360.common.PageResponse;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.employee.dto.requests.CreateEmployeeRequest;
import com.peoplepay360.modules.employee.dto.responses.EmployeeResponse;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.repositories.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final WorkingScheduleRepository scheduleRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeResponse getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return EmployeeResponse.from(employee);
    }

    public PageResponse<EmployeeResponse> getEmployees(String query, String department, EmployeeStatus status, Pageable pageable) {
        Page<Employee> page;
        if (query != null && !query.isBlank()) {
            page = employeeRepository.searchEmployees(query.trim(), pageable);
        } else if (department != null && !department.isBlank() && status != null) {
            page = employeeRepository.findByDepartmentAndStatus(department, status, pageable);
        } else if (status != null) {
            page = employeeRepository.findByStatus(status, pageable);
        } else {
            page = employeeRepository.findAll(pageable);
        }
        return PageResponse.from(page.map(EmployeeResponse::from));
    }

    public List<String> getDepartments() {
        return employeeRepository.findDistinctDepartments();
    }

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleViolationException("Email is already registered: " + request.getEmail());
        }
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new BusinessRuleViolationException("Employee code is already in use: " + request.getEmployeeCode());
        }

        Employee manager = request.getManagerId() != null
                ? employeeRepository.findById(request.getManagerId()).orElse(null)
                : null;

        WorkingSchedule schedule = request.getWorkingScheduleId() != null
                ? scheduleRepository.findById(request.getWorkingScheduleId()).orElse(null)
                : null;

        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .department(request.getDepartment())
                .jobPosition(request.getJobPosition())
                .manager(manager)
                .workingSchedule(schedule)
                .role(request.getRole())
                .status(request.getStatus())
                .bankAccountNumber(request.getBankAccountNumber())
                .bankName(request.getBankName())
                .bankIdentifierCode(request.getBankIdentifierCode())
                .identificationNumber(request.getIdentificationNumber())
                .joiningDate(request.getJoiningDate())
                .build();

        return EmployeeResponse.from(employeeRepository.save(employee));
    }
}
