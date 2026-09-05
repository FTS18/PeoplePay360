package com.peoplepay360.modules.attendance.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.common.PageResponse;
import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.attendance.dto.requests.AttendanceOverrideRequest;
import com.peoplepay360.modules.attendance.dto.requests.AttendancePunchRequest;
import com.peoplepay360.modules.attendance.dto.responses.AttendanceResponse;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRecordRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @GetMapping
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
                : attendanceRepository.findAll(pageable);
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.from(page.map(AttendanceResponse::from))));
    }

    @PostMapping("/punch")
    public ResponseEntity<ApiResponse<AttendanceResponse>> punch(
            @Valid @RequestBody AttendancePunchRequest request,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        if (isEmployee && !currentUser.getId().equals(request.getEmployeeId())) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot punch attendance for another employee");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        Instant now = request.getTimestamp() != null ? request.getTimestamp() : Instant.now();

        AttendanceRecord record = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), request.getDate())
                .orElseGet(() -> AttendanceRecord.builder()
                        .employee(employee)
                        .date(request.getDate())
                        .expectedHours(BigDecimal.valueOf(8))
                        .status(AttendanceStatus.PRESENT)
                        .build());

        if (record.getCheckIn() == null) {
            record.setCheckIn(now);
        } else if (record.getCheckOut() == null) {
            record.setCheckOut(now);
            long minutes = Duration.between(record.getCheckIn(), now).toMinutes();
            BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            record.setWorkedHours(hours);
            if (hours.compareTo(record.getExpectedHours().divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP)) < 0) {
                record.setStatus(AttendanceStatus.HALF_DAY);
            }
        }

        AttendanceRecord saved = attendanceRepository.save(record);
        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded", AttendanceResponse.from(saved)));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getEmployeeAttendance(
            @PathVariable UUID employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @AuthenticationPrincipal SecurityUser currentUser
    ) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        if (isEmployee && !currentUser.getId().equals(employeeId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        List<AttendanceRecord> records = attendanceRepository.findByEmployeeIdAndDateBetweenOrderByDateAsc(
                employeeId, startDate, endDate
        );
        List<AttendanceResponse> responses = records.stream().map(AttendanceResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/anomalies")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceResponse>>> getAnomalies(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable
    ) {
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
        AttendanceRecord record = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRecord", "id", id));

        Employee reviewer = employeeRepository.findById(currentUser.getId()).orElse(null);

        record.setCheckIn(request.getCheckIn());
        record.setCheckOut(request.getCheckOut());
        record.setWorkedHours(request.getWorkedHours());
        record.setStatus(request.getStatus());
        record.setManualOverride(true);
        record.setOverrideReason(request.getOverrideReason());
        record.setReviewedBy(reviewer);

        AttendanceRecord saved = attendanceRepository.save(record);
        return ResponseEntity.ok(ApiResponse.ok("Attendance record updated with override audit", AttendanceResponse.from(saved)));
    }
}
