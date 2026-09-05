package com.peoplepay360.modules.timeoff.dto.responses;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.timeoff.entities.TimeOffAllocation;
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
public class AllocationResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private UUID timeOffTypeId;
    private String timeOffTypeName;
    private BigDecimal allocatedUnits;
    private LocalDate validFrom;
    private LocalDate validTo;
    private TimeOffStatus status;
    private String approverName;
    private Instant approvalDate;

    public static AllocationResponse from(TimeOffAllocation allocation) {
        String empName = allocation.getEmployee() != null
                ? allocation.getEmployee().getFirstName() + " " + allocation.getEmployee().getLastName()
                : "Unknown";

        String appName = allocation.getApprover() != null
                ? allocation.getApprover().getFirstName() + " " + allocation.getApprover().getLastName()
                : null;

        return AllocationResponse.builder()
                .id(allocation.getId())
                .employeeId(allocation.getEmployee() != null ? allocation.getEmployee().getId() : null)
                .employeeName(empName)
                .timeOffTypeId(allocation.getTimeOffType() != null ? allocation.getTimeOffType().getId() : null)
                .timeOffTypeName(allocation.getTimeOffType() != null ? allocation.getTimeOffType().getName() : null)
                .allocatedUnits(allocation.getAllocatedUnits())
                .validFrom(allocation.getValidFrom())
                .validTo(allocation.getValidTo())
                .status(allocation.getStatus())
                .approverName(appName)
                .approvalDate(allocation.getApprovalDate())
                .build();
    }
}
