package com.peoplepay360.modules.attendance.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.modules.attendance.dto.requests.AttendanceOverrideRequest;
import com.peoplepay360.modules.attendance.dto.requests.AttendancePunchRequest;
import com.peoplepay360.modules.attendance.dto.responses.AttendanceResponse;
import com.peoplepay360.modules.attendance.dto.responses.AttendanceStatsResponse;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.attendance.services.AttendanceService;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceRecordRepository attendanceRepository;

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<AttendanceStatsResponse>> getAttendanceStats(
            @RequestParam(required = false) UUID employeeId,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        UUID resolvedId = isEmployee ? currentUser.getId() : employeeId;

        AttendanceRecordRepository.AttendanceStatsProjection agg =
                attendanceRepository.getAttendanceStatsAggregated(resolvedId);

        AttendanceStatsResponse stats = AttendanceStatsResponse.builder()
                .totalEntries(agg != null && agg.getTotalEntries() != null ? agg.getTotalEntries() : 0L)
                .presentCount(agg != null && agg.getPresentCount() != null ? agg.getPresentCount() : 0L)
                .exceptionCount(agg != null && agg.getExceptionCount() != null ? agg.getExceptionCount() : 0L)
                .totalWorkedHours(agg != null && agg.getTotalWorkedHours() != null ? agg.getTotalWorkedHours() : BigDecimal.ZERO)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<AttendanceResponse>>> getAllAttendance(
            @RequestParam(required = false) UUID employeeId,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        // EMPLOYEE role is always scoped to their own records regardless of the query param.
        UUID resolvedId = isEmployee ? currentUser.getId() : employeeId;
        Page<AttendanceRecord> page = resolvedId != null
                ? attendanceRepository.findByEmployeeIdOrderByDateDesc(resolvedId, pageable)
                : attendanceRepository.findAllByOrderByDateDesc(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(AttendanceResponse::from))));
    }

    @PostMapping("/punch")
    public ResponseEntity<ApiResponse<AttendanceResponse>> punch(
            @Valid @RequestBody AttendancePunchRequest request,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        AttendanceRecord saved = attendanceService.punch(request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded", AttendanceResponse.from(saved)));
    }

    @GetMapping("/employee/{employeeId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getEmployeeAttendance(
            @PathVariable UUID employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        if (endDate.isBefore(startDate)) {
            throw new BusinessRuleViolationException("End date cannot precede start date");
        }

        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        if (isEmployee && !currentUser.getId().equals(employeeId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        List<AttendanceRecord> records = attendanceRepository
                .findByEmployeeIdAndDateBetweenOrderByDateAsc(employeeId, startDate, endDate);
        List<AttendanceResponse> responses = records.stream().map(AttendanceResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/anomalies")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<AttendanceResponse>>> getAnomalies(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        if (endDate.isBefore(startDate)) {
            throw new BusinessRuleViolationException("End date cannot precede start date");
        }

        Page<AttendanceRecord> page = attendanceRepository.findAnomaliesInDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(AttendanceResponse::from))));
    }

    @PutMapping("/{id}/override")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceResponse>> overrideRecord(
            @PathVariable UUID id,
            @Valid @RequestBody AttendanceOverrideRequest request,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        AttendanceRecord saved = attendanceService.override(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Attendance record updated with override audit", AttendanceResponse.from(saved)));
    }
}
