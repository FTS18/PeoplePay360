package com.peoplepay360.modules.timeoff.dto.requests;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAllocationRequest {

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotNull(message = "Time off type ID is required")
    private UUID timeOffTypeId;

    @NotNull(message = "Allocated units are required")
    @DecimalMin(value = "0.5", message = "Allocated units must be at least 0.5")
    private BigDecimal allocatedUnits;

    @NotNull(message = "Valid from date is required")
    private LocalDate validFrom;

    @NotNull(message = "Valid to date is required")
    private LocalDate validTo;
}
