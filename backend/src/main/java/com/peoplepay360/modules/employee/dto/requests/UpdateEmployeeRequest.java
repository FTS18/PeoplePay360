package com.peoplepay360.modules.employee.dto.requests;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
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
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String department;
    private String jobPosition;
    private UUID managerId;
    private UUID workingScheduleId;
    private Role role;
    private EmployeeStatus status;
    private String bankAccountNumber;
    private String bankName;
    private String bankIdentifierCode;
    private String identificationNumber;
}
