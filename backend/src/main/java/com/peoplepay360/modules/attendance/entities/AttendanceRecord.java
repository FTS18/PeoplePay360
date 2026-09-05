package com.peoplepay360.modules.attendance.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.AttendanceStatus;
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
    name = "attendance_records",
    indexes = {
        @Index(name = "idx_attendance_emp_date", columnList = "employee_id, date", unique = true),
        @Index(name = "idx_attendance_status", columnList = "status"),
        @Index(name = "idx_attendance_date", columnList = "date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "check_in")
    private Instant checkIn;

    @Column(name = "check_out")
    private Instant checkOut;

    @Column(name = "worked_hours", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal workedHours = BigDecimal.ZERO;

    @Column(name = "expected_hours", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal expectedHours = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "manual_override", nullable = false)
    @Builder.Default
    private boolean manualOverride = false;

    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private Employee reviewedBy;
}
