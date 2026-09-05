package com.peoplepay360.modules.schedule.entities;

import com.peoplepay360.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "working_schedule_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkingScheduleLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "working_schedule_id", nullable = false)
    private WorkingSchedule workingSchedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 20)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "break_hours", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal breakHours = BigDecimal.ZERO;

    @Column(name = "work_hours", nullable = false, precision = 4, scale = 2)
    private BigDecimal workHours;
}
