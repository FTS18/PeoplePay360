package com.peoplepay360.modules.attendance.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceStatsResponse {
    private long totalEntries;
    private long presentCount;
    private long exceptionCount;
    private BigDecimal totalWorkedHours;
}
