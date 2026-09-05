package com.peoplepay360.modules.attendance.services;

import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.attendance.dto.requests.AttendanceOverrideRequest;
import com.peoplepay360.modules.attendance.dto.requests.AttendancePunchRequest;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.payroll.repositories.PayrunRepository;
import com.peoplepay360.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private static final BigDecimal DEFAULT_SHIFT_HOURS = BigDecimal.valueOf(8);

    private final AttendanceRecordRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrunRepository payrunRepository;

    @Transactional
    public AttendanceRecord punch(AttendancePunchRequest request, SecurityUser currentUser) {
        boolean isEmployee = currentUser.getRole().name().equals("EMPLOYEE");
        if (isEmployee && !currentUser.getId().equals(request.getEmployeeId())) {
            throw new AccessDeniedException("Cannot punch attendance for another employee");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        Instant now = request.getTimestamp() != null ? request.getTimestamp() : Instant.now();

        BigDecimal expectedHours = (employee.getWorkingSchedule() != null
                && employee.getWorkingSchedule().getAverageHoursPerDay() != null)
                ? employee.getWorkingSchedule().getAverageHoursPerDay()
                : DEFAULT_SHIFT_HOURS;

        AttendanceRecord record = attendanceRepository
                .findByEmployeeIdAndDate(employee.getId(), request.getDate())
                .orElseGet(() -> AttendanceRecord.builder()
                        .employee(employee)
                        .date(request.getDate())
                        .expectedHours(expectedHours)
                        .status(AttendanceStatus.PRESENT)
                        .build());

        if (record.getCheckIn() == null) {
            record.setCheckIn(now);
        } else if (record.getCheckOut() == null) {
            record.setCheckOut(now);
            long seconds = Duration.between(record.getCheckIn(), now).getSeconds();
            BigDecimal hours = BigDecimal.valueOf(seconds)
                    .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
            record.setWorkedHours(hours);

            // Mark half-day if worked less than half the expected shift
            BigDecimal halfExpected = record.getExpectedHours()
                    .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            if (hours.compareTo(halfExpected) < 0) {
                record.setStatus(AttendanceStatus.HALF_DAY);
            }
        }

        return attendanceRepository.save(record);
    }

    @Transactional
    public AttendanceRecord override(UUID recordId, AttendanceOverrideRequest request, SecurityUser currentUser) {
        AttendanceRecord record = attendanceRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("AttendanceRecord", "id", recordId));

        boolean isLocked = payrunRepository.existsPaidPayrunForEmployeeOnDate(
                record.getEmployee().getId(), record.getDate());
        if (isLocked) {
            throw new BusinessRuleViolationException(
                    "Attendance records belonging to a finalized and paid payrun period cannot be modified retroactively");
        }

        Employee reviewer = employeeRepository.findById(currentUser.getId()).orElse(null);

        record.setCheckIn(request.getCheckIn());
        record.setCheckOut(request.getCheckOut());
        record.setWorkedHours(request.getWorkedHours());
        record.setStatus(request.getStatus());
        record.setManualOverride(true);
        record.setOverrideReason(request.getOverrideReason());
        record.setReviewedBy(reviewer);

        return attendanceRepository.save(record);
    }
}
