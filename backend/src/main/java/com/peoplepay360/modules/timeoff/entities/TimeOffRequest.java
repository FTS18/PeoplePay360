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
    name = "time_off_requests",
    indexes = {
        @Index(name = "idx_requests_emp_dates", columnList = "employee_id, start_date, end_date"),
        @Index(name = "idx_requests_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeOffRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "time_off_type_id", nullable = false)
    private TimeOffType timeOffType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "requested_units", nullable = false, precision = 5, scale = 2)
    private BigDecimal requestedUnits;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private TimeOffStatus status = TimeOffStatus.CONFIRM;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private Employee approver;

    @Column(name = "approval_date")
    private Instant approvalDate;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
