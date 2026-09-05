package com.peoplepay360.modules.attendance.dto.requests;

import com.peoplepay360.common.enums.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceOverrideRequest {

    private Instant checkIn;
    private Instant checkOut;

    @NotNull(message = "Worked hours is required")
    private BigDecimal workedHours;

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    @NotBlank(message = "Override reason is mandatory for audits")
    private String overrideReason;
}
