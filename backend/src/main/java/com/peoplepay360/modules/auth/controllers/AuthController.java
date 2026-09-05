package com.peoplepay360.modules.auth.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.auth.dto.AuthResponse;
import com.peoplepay360.modules.auth.dto.LoginRequest;
import com.peoplepay360.modules.auth.dto.RegisterRequest;
import com.peoplepay360.modules.auth.dto.RefreshTokenRequest;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.payroll.repositories.SalaryStructureRepository;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.repositories.WorkingScheduleRepository;
import com.peoplepay360.security.JwtTokenProvider;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final WorkingScheduleRepository workingScheduleRepository;
    private final ContractRepository contractRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final com.peoplepay360.modules.auth.services.TokenBlacklistService tokenBlacklistService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityUser userDetails = (SecurityUser) authentication.getPrincipal();
        Employee employee = employeeRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", userDetails.getUsername()));

        String accessToken = tokenProvider.generateAccessToken(employee.getEmail(), employee.getId(), employee.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(employee.getEmail(), employee.getId(), employee.getRole().name());

        AuthResponse.UserSummary summary = AuthResponse.UserSummary.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .jobPosition(employee.getJobPosition())
                .role(employee.getRole())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(summary)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", authResponse));
    }

    @PostMapping("/demo-login")
    public ResponseEntity<ApiResponse<AuthResponse>> demoLogin(@RequestParam(required = false, defaultValue = "ADMIN") String roleStr) {
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            role = Role.ADMIN;
        }

        Employee employee = employeeRepository.findByRole(role, PageRequest.of(0, 1)).getContent().stream()
                .findFirst()
                .orElseGet(() -> employeeRepository.findAll().stream().findFirst().orElseThrow(() -> new ResourceNotFoundException("Employee", "role", roleStr)));

        String accessToken = tokenProvider.generateAccessToken(employee.getEmail(), employee.getId(), employee.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(employee.getEmail(), employee.getId(), employee.getRole().name());

        AuthResponse.UserSummary summary = AuthResponse.UserSummary.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .jobPosition(employee.getJobPosition())
                .role(employee.getRole())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(summary)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Demo login successful", authResponse));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (employeeRepository.findByEmail(request.getEmail().trim().toLowerCase()).isPresent()) {
            throw new BusinessRuleViolationException("An employee account with email '" + request.getEmail() + "' already exists");
        }

        long nextIndex = employeeRepository.count() + 1;
        String employeeCode = String.format("EMP%03d", nextIndex);
        while (employeeRepository.findByEmployeeCode(employeeCode).isPresent()) {
            nextIndex++;
            employeeCode = String.format("EMP%03d", nextIndex);
        }

        WorkingSchedule defaultSchedule = workingScheduleRepository.findAll().stream().findFirst().orElse(null);
        Role userRole = Role.EMPLOYEE;

        Employee employee = Employee.builder()
                .employeeCode(employeeCode)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .department(request.getDepartment().trim())
                .jobPosition(request.getJobPosition().trim())
                .role(userRole)
                .status(EmployeeStatus.ACTIVE)
                .workingSchedule(defaultSchedule)
                .bankAccountNumber(request.getBankAccountNumber())
                .bankName(request.getBankName() != null && !request.getBankName().isBlank() ? request.getBankName() : "HDFC Bank")
                .bankIdentifierCode(request.getBankIdentifierCode())
                .identificationNumber(request.getIdentificationNumber())
                .joiningDate(LocalDate.now())
                .build();

        Employee saved = employeeRepository.save(employee);

        if (request.getMonthlyWage() != null && request.getMonthlyWage().compareTo(BigDecimal.ZERO) > 0) {
            SalaryStructure structure = salaryStructureRepository.findAll().stream().findFirst().orElse(null);
            if (structure != null) {
                Contract contract = Contract.builder()
                        .reference("CTR-" + saved.getEmployeeCode() + "-" + LocalDate.now().getYear())
                        .employee(saved)
                        .department(saved.getDepartment())
                        .jobPosition(saved.getJobPosition())
                        .salaryStructure(structure)
                        .workingSchedule(defaultSchedule)
                        .wage(request.getMonthlyWage())
                        .startDate(LocalDate.now())
                        .status(ContractStatus.RUNNING)
                        .build();
                contractRepository.save(contract);
            }
        }

        String accessToken = tokenProvider.generateAccessToken(saved.getEmail(), saved.getId(), saved.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(saved.getEmail(), saved.getId(), saved.getRole().name());

        AuthResponse.UserSummary summary = AuthResponse.UserSummary.builder()
                .id(saved.getId())
                .employeeCode(saved.getEmployeeCode())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .department(saved.getDepartment())
                .jobPosition(saved.getJobPosition())
                .role(saved.getRole())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(summary)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Employee registered and onboarded successfully", authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserSummary>> getCurrentUser(
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        Employee employee = employeeRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", currentUser.getId()));

        AuthResponse.UserSummary summary = AuthResponse.UserSummary.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .jobPosition(employee.getJobPosition())
                .role(employee.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        
        if (!tokenProvider.validateToken(token)) {
            throw new BusinessRuleViolationException("Invalid or expired refresh token");
        }
        
        try {
            String email = tokenProvider.getEmailFromToken(token);
            java.util.UUID userId = tokenProvider.getUserIdFromToken(token);
            String role = tokenProvider.getRoleFromToken(token);
            
            String newAccessToken = tokenProvider.generateAccessToken(email, userId, role);
            
            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(token)
                    .build();
                    
            return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully", authResponse));
        } catch (Exception ex) {
            throw new BusinessRuleViolationException("Could not process refresh token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            jakarta.servlet.http.HttpServletRequest httpRequest,
            @RequestBody(required = false) RefreshTokenRequest request
    ) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklistToken(token, 86400000L); // 24h TTL
        }
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            tokenBlacklistService.blacklistToken(request.getRefreshToken(), 604800000L); // 7 days TTL
        }
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully from server", null));
    }

    @GetMapping("/demo-users")
    public ResponseEntity<ApiResponse<List<AuthResponse.UserSummary>>> getDemoUsers(
            @RequestParam(name = "role", required = false, defaultValue = "EMPLOYEE") String roleStr) {
        
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            role = Role.EMPLOYEE;
        }

        List<Employee> dummyUsers = employeeRepository.findByRole(role, PageRequest.of(0, 10)).getContent();
        
        List<AuthResponse.UserSummary> summaries = dummyUsers.stream()
                .map(e -> AuthResponse.UserSummary.builder()
                        .id(e.getId())
                        .employeeCode(e.getEmployeeCode())
                        .fullName(e.getFullName())
                        .email(e.getEmail())
                        .department(e.getDepartment())
                        .jobPosition(e.getJobPosition())
                        .role(e.getRole())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(summaries));
    }
}
