package com.peoplepay360.modules.payroll.dto.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePayrunRequest {

    @NotBlank(message = "Payrun name is required")
    @jakarta.validation.constraints.Size(min = 3, max = 100, message = "Payrun name must be between 3 and 100 characters")
    private String name;

    @NotNull(message = "Salary structure ID is required")
    private UUID salaryStructureId;

    @NotNull(message = "Period start date is required")
    private LocalDate periodStart;

    @NotNull(message = "Period end date is required")
    private LocalDate periodEnd;
}
