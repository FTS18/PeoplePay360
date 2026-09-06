package com.peoplepay360.modules.schedule.dto.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleLineDto {

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Builder.Default
    @jakarta.validation.constraints.DecimalMin(value = "0.0", message = "Break hours cannot be negative")
    @jakarta.validation.constraints.DecimalMax(value = "24.0", message = "Break hours cannot exceed 24 hours")
    private BigDecimal breakHours = BigDecimal.ZERO;
}
