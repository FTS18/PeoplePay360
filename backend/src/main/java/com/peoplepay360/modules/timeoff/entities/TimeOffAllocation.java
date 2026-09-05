package com.peoplepay360.modules.timeoff.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.employee.entities.Employee;
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
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
    name = "time_off_allocations",
    indexes = {
        @Index(name = "idx_alloc_emp_type", columnList = "employee_id, time_off_type_id"),
        @Index(name = "idx_alloc_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeOffAllocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "time_off_type_id", nullable = false)
    private TimeOffType timeOffType;

    @Column(name = "allocated_units", nullable = false, precision = 5, scale = 2)
    private BigDecimal allocatedUnits;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TimeOffStatus status = TimeOffStatus.CONFIRM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private Employee approver;

    @Column(name = "approval_date")
    private Instant approvalDate;
}
