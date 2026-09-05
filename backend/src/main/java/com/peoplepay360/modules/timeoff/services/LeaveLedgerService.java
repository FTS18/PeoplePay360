package com.peoplepay360.modules.timeoff.services;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.InsufficientLeaveBalanceException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.timeoff.entities.TimeOffRequest;
import com.peoplepay360.modules.timeoff.entities.TimeOffType;
import com.peoplepay360.modules.timeoff.repositories.TimeOffAllocationRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffRequestRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveLedgerService {

    private final TimeOffAllocationRepository allocationRepository;
    private final TimeOffRequestRepository requestRepository;
    private final TimeOffTypeRepository typeRepository;

    public BigDecimal getAvailableBalance(UUID employeeId, UUID timeOffTypeId, LocalDate asOfDate) {
        BigDecimal totalAllocated = allocationRepository.sumApprovedAllocations(employeeId, timeOffTypeId, asOfDate);
        LocalDate validFrom = LocalDate.of(asOfDate.getYear(), 1, 1);
        LocalDate validTo = LocalDate.of(asOfDate.getYear(), 12, 31);
        BigDecimal totalTaken = requestRepository.sumApprovedTakenUnits(employeeId, timeOffTypeId, validFrom, validTo);
        return totalAllocated.subtract(totalTaken).max(BigDecimal.ZERO);
    }

    @Transactional
    public TimeOffRequest applyLeave(TimeOffRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessRuleViolationException("Leave end date cannot precede start date");
        }

        if (request.getRequestedUnits() == null || request.getRequestedUnits().signum() <= 0) {
            throw new BusinessRuleViolationException("Requested leave units must be strictly positive");
        }

        boolean hasOverlap = requestRepository.existsOverlappingRequest(
                request.getEmployee().getId(),
                request.getId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (hasOverlap) {
            throw new BusinessRuleViolationException("An existing or pending leave request already overlaps this period");
        }

        TimeOffType type = typeRepository.findById(request.getTimeOffType().getId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "id", request.getTimeOffType().getId()));

        if (type.isRequiresAllocation()) {
            BigDecimal available = getAvailableBalance(request.getEmployee().getId(), type.getId(), request.getStartDate());
            if (available.compareTo(request.getRequestedUnits()) < 0) {
                throw new InsufficientLeaveBalanceException(type.getName(), available, request.getRequestedUnits());
            }
        }

        request.setStatus(TimeOffStatus.CONFIRM);
        return requestRepository.save(request);
    }

    @Transactional
    public TimeOffRequest approveRequest(UUID requestId, Employee approver) {
        TimeOffRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffRequest", "id", requestId));

        if (request.getStatus() != TimeOffStatus.CONFIRM) {
            throw new BusinessRuleViolationException("Only requests in CONFIRM status can be approved");
        }

        request.setStatus(TimeOffStatus.APPROVED);
        request.setApprover(approver);
        request.setApprovalDate(Instant.now());
        return requestRepository.save(request);
    }

    @Transactional
    public TimeOffRequest refuseRequest(UUID requestId, Employee approver, String reason) {
        TimeOffRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffRequest", "id", requestId));

        if (request.getStatus() == TimeOffStatus.APPROVED) {
            throw new BusinessRuleViolationException("Approved requests cannot be refused directly without formal cancellation");
        }

        request.setStatus(TimeOffStatus.REFUSED);
        request.setApprover(approver);
        request.setApprovalDate(Instant.now());
        request.setRejectionReason(reason);
        return requestRepository.save(request);
    }

    public int calculateClippedLeaveDays(UUID employeeId, LocalDate periodStart, LocalDate periodEnd, boolean isPaid) {
        java.util.List<TimeOffRequest> leaves = requestRepository.findApprovedLeavesInWindow(employeeId, periodStart, periodEnd, isPaid);
        int totalDays = 0;
        for (TimeOffRequest req : leaves) {
            LocalDate start = req.getStartDate().isAfter(periodStart) ? req.getStartDate() : periodStart;
            LocalDate end = req.getEndDate().isBefore(periodEnd) ? req.getEndDate() : periodEnd;
            long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
            totalDays += (int) Math.max(0, days);
        }
        return totalDays;
    }
}
