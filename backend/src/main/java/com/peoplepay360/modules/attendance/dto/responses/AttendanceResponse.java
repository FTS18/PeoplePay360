package com.peoplepay360.modules.attendance.dto.responses;

import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private LocalDate date;
    private Instant checkIn;
    private Instant checkOut;
    private BigDecimal workedHours;
    private BigDecimal expectedHours;
    private AttendanceStatus status;
    private boolean manualOverride;
    private String overrideReason;
    private String reviewedByName;

    public static AttendanceResponse from(AttendanceRecord record) {
        return AttendanceResponse.builder()
                .id(record.getId())
                .employeeId(record.getEmployee().getId())
                .employeeName(record.getEmployee().getFullName())
                .date(record.getDate())
                .checkIn(record.getCheckIn())
                .checkOut(record.getCheckOut())
                .workedHours(record.getWorkedHours())
                .expectedHours(record.getExpectedHours())
                .status(record.getStatus())
                .manualOverride(record.isManualOverride())
                .overrideReason(record.getOverrideReason())
                .reviewedByName(record.getReviewedBy() != null ? record.getReviewedBy().getFullName() : null)
                .build();
    }
}
