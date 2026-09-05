package com.peoplepay360.modules.schedule.dto.responses;

import com.peoplepay360.common.enums.ScheduleType;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ScheduleResponse {

    private UUID id;
    private String name;
    private ScheduleType type;
    private BigDecimal averageHoursPerDay;
    private BigDecimal totalWeeklyHours;
    private boolean active;
    private List<LineDetail> lines;

    public ScheduleResponse() {
    }

    public ScheduleResponse(
            UUID id,
            String name,
            ScheduleType type,
            BigDecimal averageHoursPerDay,
            BigDecimal totalWeeklyHours,
            boolean active,
            List<LineDetail> lines
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.averageHoursPerDay = averageHoursPerDay;
        this.totalWeeklyHours = totalWeeklyHours;
        this.active = active;
        this.lines = lines;
    }

    @Getter
    @Setter
    @Builder
    public static class LineDetail {
        private UUID id;
        private DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal breakHours;
        private BigDecimal workHours;

        public LineDetail() {
        }

        public LineDetail(
                UUID id,
                DayOfWeek dayOfWeek,
                LocalTime startTime,
                LocalTime endTime,
                BigDecimal breakHours,
                BigDecimal workHours
        ) {
            this.id = id;
            this.dayOfWeek = dayOfWeek;
            this.startTime = startTime;
            this.endTime = endTime;
            this.breakHours = breakHours;
            this.workHours = workHours;
        }
    }

    public static ScheduleResponse from(WorkingSchedule schedule) {
        List<LineDetail> lines = schedule.getLines() != null
                ? schedule.getLines().stream().map(l -> LineDetail.builder()
                .id(l.getId())
                .dayOfWeek(l.getDayOfWeek())
                .startTime(l.getStartTime())
                .endTime(l.getEndTime())
                .breakHours(l.getBreakHours())
                .workHours(l.getWorkHours())
                .build()).toList()
                : List.of();

        return ScheduleResponse.builder()
                .id(schedule.getId())
                .name(schedule.getName())
                .type(schedule.getType())
                .averageHoursPerDay(schedule.getAverageHoursPerDay())
                .totalWeeklyHours(schedule.getTotalWeeklyHours())
                .active(schedule.isActive())
                .lines(lines)
                .build();
    }
}
