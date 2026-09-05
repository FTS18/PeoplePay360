package com.peoplepay360.modules.contract.dto.responses;

import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.modules.contract.entities.Contract;
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
public class ContractResponse {

    private UUID id;
    private String reference;
    private UUID employeeId;
    private String employeeName;
    private String department;
    private String jobPosition;
    private UUID salaryStructureId;
    private String salaryStructureName;
    private UUID workingScheduleId;
    private String workingScheduleName;
    private BigDecimal wage;
    private LocalDate startDate;
    private LocalDate endDate;
    private ContractStatus status;

    public static ContractResponse from(Contract contract) {
        return ContractResponse.builder()
                .id(contract.getId())
                .reference(contract.getReference())
                .employeeId(contract.getEmployee().getId())
                .employeeName(contract.getEmployee().getFullName())
                .department(contract.getDepartment())
                .jobPosition(contract.getJobPosition())
                .salaryStructureId(contract.getSalaryStructure().getId())
                .salaryStructureName(contract.getSalaryStructure().getName())
                .workingScheduleId(contract.getWorkingSchedule().getId())
                .workingScheduleName(contract.getWorkingSchedule().getName())
                .wage(contract.getWage())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus())
                .build();
    }
}
