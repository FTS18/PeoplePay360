package com.peoplepay360.modules.schedule.services;

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
        scheduleRepository.delete(schedule);
    }

    public void recalculateHours(WorkingSchedule schedule) {
        BigDecimal totalWeekly = BigDecimal.ZERO;

        if (schedule.getLines() != null && !schedule.getLines().isEmpty()) {
            for (WorkingScheduleLine line : schedule.getLines()) {
                long minutes = Duration.between(line.getStartTime(), line.getEndTime()).toMinutes();
                BigDecimal shiftHours = BigDecimal.valueOf(minutes)
                        .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

                BigDecimal breakHours = line.getBreakHours() != null ? line.getBreakHours() : BigDecimal.ZERO;
                BigDecimal netWorkHours = shiftHours.subtract(breakHours).max(BigDecimal.ZERO);

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
