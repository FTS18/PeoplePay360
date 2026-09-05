package com.peoplepay360.modules.auth.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.auth.dto.AuthResponse;
import com.peoplepay360.modules.auth.dto.LoginRequest;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.security.JwtTokenProvider;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeRepository employeeRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityUser userDetails = (SecurityUser) authentication.getPrincipal();
        Employee employee = employeeRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "email", userDetails.getUsername()));

        String token = tokenProvider.generateToken(employee.getEmail(), employee.getId(), employee.getRole().name());

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
                .accessToken(token)
                .user(summary)
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Login successful", authResponse));
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
}
