package com.peoplepay360.modules.contract.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
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

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
    name = "contracts",
    indexes = {
        @Index(name = "idx_contracts_employee_status", columnList = "employee_id, status"),
        @Index(name = "idx_contracts_reference", columnList = "reference", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract extends BaseEntity {

    @Column(name = "reference", nullable = false, unique = true, length = 50)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "job_position", nullable = false, length = 100)
    private String jobPosition;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "working_schedule_id", nullable = false)
    private WorkingSchedule workingSchedule;

    @Column(name = "wage", nullable = false, precision = 12, scale = 2)
    private BigDecimal wage;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    public boolean isActiveOn(LocalDate date) {
        if (status != ContractStatus.RUNNING) return false;
        if (date.isBefore(startDate)) return false;
        return endDate == null || !date.isAfter(endDate);
    }
}
