package com.peoplepay360.modules.timeoff.services;

import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.InsufficientLeaveBalanceException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
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
    private final AttendanceRecordRepository attendanceRepository;

    public BigDecimal getAvailableBalance(UUID employeeId, UUID timeOffTypeId, LocalDate asOfDate) {
        BigDecimal totalAllocated = allocationRepository.sumApprovedAllocations(employeeId, timeOffTypeId, asOfDate);
        LocalDate validFrom = LocalDate.of(asOfDate.getYear(), 1, 1);
        LocalDate validTo = LocalDate.of(asOfDate.getYear(), 12, 31);
        BigDecimal totalTaken = requestRepository.sumApprovedTakenUnits(employeeId, timeOffTypeId, validFrom, validTo);
        return totalAllocated.subtract(totalTaken).max(BigDecimal.ZERO);
    }

    // Bulk variant: fetches all allocations and taken units for all types in 2 queries total.
    public java.util.Map<UUID, BigDecimal> getAllAvailableBalances(UUID employeeId, LocalDate asOfDate) {
        LocalDate validFrom = LocalDate.of(asOfDate.getYear(), 1, 1);
        LocalDate validTo = LocalDate.of(asOfDate.getYear(), 12, 31);

        java.util.Map<UUID, BigDecimal> allocatedMap = new java.util.HashMap<>();
        for (Object[] row : allocationRepository.sumApprovedAllocationsGroupedByType(employeeId, asOfDate)) {
            allocatedMap.put((UUID) row[0], (BigDecimal) row[1]);
        }

        java.util.Map<UUID, BigDecimal> takenMap = new java.util.HashMap<>();
        for (Object[] row : requestRepository.sumApprovedTakenUnitsGroupedByType(employeeId, validFrom, validTo)) {
            takenMap.put((UUID) row[0], (BigDecimal) row[1]);
        }

        java.util.Map<UUID, BigDecimal> balances = new java.util.HashMap<>();
        java.util.Set<UUID> allTypeIds = new java.util.HashSet<>(allocatedMap.keySet());
        allTypeIds.addAll(takenMap.keySet());

        for (UUID typeId : allTypeIds) {
            BigDecimal allocated = allocatedMap.getOrDefault(typeId, BigDecimal.ZERO);
            BigDecimal taken = takenMap.getOrDefault(typeId, BigDecimal.ZERO);
            balances.put(typeId, allocated.subtract(taken).max(BigDecimal.ZERO));
        }

        return balances;
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

        // Auto-seed attendance records for each day of approved leave
        LocalDate curr = request.getStartDate();
        BigDecimal expectedHours = (request.getEmployee().getWorkingSchedule() != null && request.getEmployee().getWorkingSchedule().getAverageHoursPerDay() != null)
                ? request.getEmployee().getWorkingSchedule().getAverageHoursPerDay()
                : BigDecimal.valueOf(8);

        java.util.List<AttendanceRecord> existingRecords = attendanceRepository.findByEmployeeIdAndDateBetween(
                request.getEmployee().getId(), request.getStartDate(), request.getEndDate());
        java.util.Set<LocalDate> existingDates = existingRecords.stream()
                .map(AttendanceRecord::getDate)
                .collect(java.util.stream.Collectors.toSet());

        java.util.List<AttendanceRecord> toInsert = new java.util.ArrayList<>();
        while (!curr.isAfter(request.getEndDate())) {
            if (!existingDates.contains(curr)) {
                toInsert.add(AttendanceRecord.builder()
                        .employee(request.getEmployee())
                        .date(curr)
                        .expectedHours(expectedHours)
                        .workedHours(request.getTimeOffType().isPaid() ? expectedHours : BigDecimal.ZERO)
                        .status(request.getTimeOffType().isPaid() ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT)
                        .manualOverride(true)
                        .overrideReason("Approved Time Off: " + request.getTimeOffType().getName())
                        .reviewedBy(approver)
                        .build());
            }
            curr = curr.plusDays(1);
        }

        if (!toInsert.isEmpty()) {
            attendanceRepository.saveAll(toInsert);
        }

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
