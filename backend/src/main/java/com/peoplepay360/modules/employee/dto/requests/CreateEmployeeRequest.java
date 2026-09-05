package com.peoplepay360.modules.employee.dto.requests;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String employeeCode;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phone;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Job position is required")
    private String jobPosition;

    private UUID managerId;
    private UUID workingScheduleId;

    @NotNull(message = "Role is required")
    private Role role;

    @NotNull(message = "Status is required")
    private EmployeeStatus status;

    private String bankAccountNumber;
    private String bankName;
    private String bankIdentifierCode;
    private String identificationNumber;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;
}
