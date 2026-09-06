package com.peoplepay360.modules.schedule.services;

import com.peoplepay360.exception.BusinessRuleViolationException;
import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.entities.WorkingScheduleLine;
import com.peoplepay360.modules.schedule.repositories.WorkingScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkingScheduleService {

    private final WorkingScheduleRepository scheduleRepository;
    private final com.peoplepay360.modules.employee.repositories.EmployeeRepository employeeRepository;
    private final com.peoplepay360.modules.contract.repositories.ContractRepository contractRepository;

    public List<WorkingSchedule> getAllSchedules() {
        return scheduleRepository.findAllWithLines();
    }

    public WorkingSchedule getScheduleById(UUID id) {
        return scheduleRepository.findWithLinesById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WorkingSchedule", "id", id));
    }

    @Transactional
    public WorkingSchedule saveSchedule(WorkingSchedule schedule) {
        recalculateHours(schedule);
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(UUID id) {
        WorkingSchedule schedule = getScheduleById(id);
        if (employeeRepository.existsByWorkingScheduleId(id)) {
            throw new BusinessRuleViolationException("Cannot delete working schedule: active employees are currently assigned to this schedule");
        }
        if (contractRepository.existsByWorkingScheduleId(id)) {
            throw new BusinessRuleViolationException("Cannot delete working schedule: active contracts are currently assigned to this schedule");
        }
        scheduleRepository.delete(schedule);
    }

    public void recalculateHours(WorkingSchedule schedule) {
        BigDecimal totalWeekly = BigDecimal.ZERO;

        if (schedule.getLines() != null && !schedule.getLines().isEmpty()) {
            java.util.Set<java.time.DayOfWeek> seenDays = new java.util.HashSet<>();
            for (WorkingScheduleLine line : schedule.getLines()) {
                if (line.getDayOfWeek() == null) {
                    throw new BusinessRuleViolationException("Day of week is required");
                }
                if (!seenDays.add(line.getDayOfWeek())) {
                    throw new BusinessRuleViolationException("Duplicate working schedule line for " + line.getDayOfWeek());
                }
                if (line.getStartTime() == null || line.getEndTime() == null) {
                    throw new BusinessRuleViolationException("Start time and end time are required for " + line.getDayOfWeek());
                }
                if (!line.getEndTime().isAfter(line.getStartTime())) {
                    throw new BusinessRuleViolationException("End time (" + line.getEndTime() + ") must be after start time (" + line.getStartTime() + ") for " + line.getDayOfWeek());
                }

                long minutes = Duration.between(line.getStartTime(), line.getEndTime()).toMinutes();
                BigDecimal shiftHours = BigDecimal.valueOf(minutes)
                        .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

                BigDecimal breakHours = line.getBreakHours() != null ? line.getBreakHours() : BigDecimal.ZERO;
                if (breakHours.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BusinessRuleViolationException("Break hours cannot be negative for " + line.getDayOfWeek());
                }
                if (breakHours.compareTo(shiftHours) >= 0) {
                    throw new BusinessRuleViolationException("Break hours (" + breakHours + "h) must be strictly less than shift duration (" + shiftHours + "h) for " + line.getDayOfWeek());
                }

                BigDecimal netWorkHours = shiftHours.subtract(breakHours);

                line.setWorkHours(netWorkHours);
                line.setWorkingSchedule(schedule);
                totalWeekly = totalWeekly.add(netWorkHours);
            }

            int daysCount = schedule.getLines().size();
            BigDecimal avgPerDay = totalWeekly.divide(BigDecimal.valueOf(daysCount), 2, RoundingMode.HALF_UP);
            schedule.setAverageHoursPerDay(avgPerDay);
        } else {
            schedule.setAverageHoursPerDay(BigDecimal.ZERO);
        }

        schedule.setTotalWeeklyHours(totalWeekly);
    }
}
