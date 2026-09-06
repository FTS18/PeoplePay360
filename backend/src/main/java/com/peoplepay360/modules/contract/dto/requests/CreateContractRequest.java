package com.peoplepay360.modules.contract.dto.requests;

import com.peoplepay360.common.enums.ContractStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
public class CreateContractRequest {

    @NotBlank(message = "Contract reference is required")
    @jakarta.validation.constraints.Size(min = 2, max = 50, message = "Contract reference must be between 2 and 50 characters")
    @jakarta.validation.constraints.Pattern(regexp = "^[A-Za-z0-9-_/]+$", message = "Contract reference can only contain alphanumeric characters, slashes, hyphens, and underscores")
    private String reference;

    @NotNull(message = "Employee ID is required")
    private UUID employeeId;

    @NotBlank(message = "Department is required")
    @jakarta.validation.constraints.Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;

    @NotBlank(message = "Job position is required")
    @jakarta.validation.constraints.Size(min = 2, max = 100, message = "Job position must be between 2 and 100 characters")
    private String jobPosition;

    @NotNull(message = "Salary structure ID is required")
    private UUID salaryStructureId;

    @NotNull(message = "Working schedule ID is required")
    private UUID workingScheduleId;

    @NotNull(message = "Wage is required")
    @DecimalMin(value = "0.01", message = "Wage must be strictly positive")
    @jakarta.validation.constraints.DecimalMax(value = "100000000.00", message = "Wage cannot exceed 100,000,000.00")
    private BigDecimal wage;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "Status is required")
    private ContractStatus status;
}
