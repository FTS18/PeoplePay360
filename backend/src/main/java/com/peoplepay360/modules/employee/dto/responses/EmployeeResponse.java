package com.peoplepay360.modules.employee.dto.responses;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import com.peoplepay360.modules.employee.entities.Employee;
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
public class EmployeeResponse {

    private UUID id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String jobPosition;
    private UUID managerId;
    private String managerName;
    private UUID workingScheduleId;
    private String workingScheduleName;
    private Role role;
    private EmployeeStatus status;
    private String bankAccountNumber;
    private String bankName;
    private String bankIdentifierCode;
    private String identificationNumber;
    private LocalDate joiningDate;

    public static EmployeeResponse from(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .jobPosition(employee.getJobPosition())
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? employee.getManager().getFullName() : null)
                .workingScheduleId(employee.getWorkingSchedule() != null ? employee.getWorkingSchedule().getId() : null)
                .workingScheduleName(employee.getWorkingSchedule() != null ? employee.getWorkingSchedule().getName() : null)
                .role(employee.getRole())
                .status(employee.getStatus())
                .bankAccountNumber(employee.getBankAccountNumber())
                .bankName(employee.getBankName())
                .bankIdentifierCode(employee.getBankIdentifierCode())
                .identificationNumber(employee.getIdentificationNumber())
                .joiningDate(employee.getJoiningDate())
                .build();
    }
}
