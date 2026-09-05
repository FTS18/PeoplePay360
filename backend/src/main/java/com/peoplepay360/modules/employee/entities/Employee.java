package com.peoplepay360.modules.employee.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(
    name = "employees",
    indexes = {
        @Index(name = "idx_employees_email", columnList = "email", unique = true),
        @Index(name = "idx_employees_code", columnList = "employee_code", unique = true),
        @Index(name = "idx_employees_department", columnList = "department"),
        @Index(name = "idx_employees_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends BaseEntity {

    @Column(name = "employee_code", nullable = false, unique = true, length = 30)
    private String employeeCode;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "job_position", nullable = false, length = 100)
    private String jobPosition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "working_schedule_id")
    private WorkingSchedule workingSchedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Role role = Role.EMPLOYEE;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_identifier_code", length = 30)
    private String bankIdentifierCode;

    @Column(name = "identification_number", length = 50)
    private String identificationNumber;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
