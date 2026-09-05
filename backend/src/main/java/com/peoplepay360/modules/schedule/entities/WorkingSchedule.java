package com.peoplepay360.modules.schedule.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.ScheduleType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "working_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkingSchedule extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private ScheduleType type;

    @Column(name = "average_hours_per_day", nullable = false, precision = 5, scale = 2)
    private BigDecimal averageHoursPerDay;

    @Column(name = "total_weekly_hours", nullable = false, precision = 5, scale = 2)
    private BigDecimal totalWeeklyHours;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "workingSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkingScheduleLine> lines = new ArrayList<>();

    public void addLine(WorkingScheduleLine line) {
        lines.add(line);
        line.setWorkingSchedule(this);
    }

    public void removeLine(WorkingScheduleLine line) {
        lines.remove(line);
        line.setWorkingSchedule(null);
    }
}
