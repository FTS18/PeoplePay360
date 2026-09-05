package com.peoplepay360.modules.timeoff.dto.responses;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.timeoff.entities.TimeOffRequest;
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
public class TimeOffRequestResponse {

    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private UUID timeOffTypeId;
    private String timeOffTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal requestedUnits;
    private TimeOffStatus status;
    private String reason;
    private String approverName;
    private Instant approvalDate;
    private String rejectionReason;

    public static TimeOffRequestResponse from(TimeOffRequest request) {
        return TimeOffRequestResponse.builder()
                .id(request.getId())
                .employeeId(request.getEmployee().getId())
                .employeeName(request.getEmployee().getFullName())
                .timeOffTypeId(request.getTimeOffType().getId())
                .timeOffTypeName(request.getTimeOffType().getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .requestedUnits(request.getRequestedUnits())
                .status(request.getStatus())
                .reason(request.getReason())
                .approverName(request.getApprover() != null ? request.getApprover().getFullName() : null)
                .approvalDate(request.getApprovalDate())
                .rejectionReason(request.getRejectionReason())
                .build();
    }
}
