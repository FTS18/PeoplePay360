package com.peoplepay360.modules.employee.dto.requests;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateEmployeeRequest {

    @Size(max = 50, message = "First name cannot exceed 50 characters")
    @Pattern(regexp = "^$|^[A-Za-z\\s.'-]{2,50}$", message = "First name must be 2 to 50 valid characters")
    private String firstName;

    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    @Pattern(regexp = "^$|^[A-Za-z\\s.'-]{1,50}$", message = "Last name must be 1 to 50 valid characters")
    private String lastName;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @Pattern(regexp = "^$|^[+0-9\\s-]{7,20}$", message = "Phone must be a valid format between 7 and 20 digits")
    private String phone;

    @Size(max = 50, message = "Department cannot exceed 50 characters")
    private String department;

    @Size(max = 100, message = "Job position cannot exceed 100 characters")
    private String jobPosition;

    private UUID managerId;
    private UUID workingScheduleId;
    private Role role;
    private EmployeeStatus status;

    @Pattern(regexp = "^$|^[0-9]{8,25}$", message = "Bank account number must be between 8 and 25 digits")
    private String bankAccountNumber;

    @Size(max = 100, message = "Bank name cannot exceed 100 characters")
    private String bankName;

    @Pattern(regexp = "^$|^[A-Za-z0-9]{4,15}$", message = "Bank identifier / IFSC code must be between 4 and 15 alphanumeric characters")
    private String bankIdentifierCode;

    @Pattern(regexp = "^$|^[A-Za-z0-9-]{5,25}$", message = "Identification / Tax ID / PAN must be between 5 and 25 characters")
    private String identificationNumber;
}
