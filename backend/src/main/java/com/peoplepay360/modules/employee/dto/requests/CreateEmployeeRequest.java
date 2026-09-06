package com.peoplepay360.modules.employee.dto.requests;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEmployeeRequest {

    @NotBlank(message = "Employee code is required")
    @Size(min = 2, max = 30, message = "Employee code must be between 2 and 30 characters")
    @Pattern(regexp = "^[A-Za-z0-9-_]+$", message = "Employee code can only contain alphanumeric characters, hyphens, and underscores")
    private String employeeCode;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z\\s.'-]+$", message = "First name can only contain letters, spaces, hyphens, or apostrophes")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    @Pattern(regexp = "^[A-Za-z\\s.'-]+$", message = "Last name can only contain letters, spaces, hyphens, or apostrophes")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be at least 6 characters")
    private String password;

    @Pattern(regexp = "^$|^[+0-9\\s-]{7,20}$", message = "Phone must be a valid format between 7 and 20 digits")
    private String phone;

    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;

    @NotBlank(message = "Job position is required")
    @Size(min = 2, max = 100, message = "Job position must be between 2 and 100 characters")
    private String jobPosition;

    private UUID managerId;
    private UUID workingScheduleId;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Status is required")
    private EmployeeStatus status;

    @Pattern(regexp = "^$|^[0-9]{8,25}$", message = "Bank account number must be between 8 and 25 digits")
    private String bankAccountNumber;

    @Size(max = 100, message = "Bank name cannot exceed 100 characters")
    private String bankName;

    @Pattern(regexp = "^$|^[A-Za-z0-9]{4,15}$", message = "Bank identifier / IFSC code must be between 4 and 15 alphanumeric characters")
    private String bankIdentifierCode;

    @Pattern(regexp = "^$|^[A-Za-z0-9-]{5,25}$", message = "Identification / Tax ID / PAN must be between 5 and 25 characters")
    private String identificationNumber;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;
}
