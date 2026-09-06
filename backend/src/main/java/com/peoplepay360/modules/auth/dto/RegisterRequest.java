package com.peoplepay360.modules.auth.dto;

import com.peoplepay360.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Work email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Job position is required")
    private String jobPosition;

    private Role role;

    private String bankAccountNumber;

    private String bankName;

    private String bankIdentifierCode;

    private String identificationNumber;

    @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Monthly wage must be greater than zero")
    private BigDecimal monthlyWage;
}
