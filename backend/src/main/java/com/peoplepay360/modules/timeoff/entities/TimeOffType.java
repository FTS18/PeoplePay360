package com.peoplepay360.modules.timeoff.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.TimeOffUnit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "time_off_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeOffType extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false, length = 20)
    private TimeOffUnit unit;

    @Column(name = "requires_allocation", nullable = false)
    @Builder.Default
    private boolean requiresAllocation = true;

    @Column(name = "color_code", length = 10)
    private String colorCode;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
