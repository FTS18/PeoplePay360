package com.peoplepay360.modules.schedule.dto.requests;

import com.peoplepay360.common.enums.ScheduleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateScheduleRequest {

    @NotBlank(message = "Schedule name is required")
    @jakarta.validation.constraints.Size(min = 2, max = 100, message = "Schedule name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Schedule type is required")
    private ScheduleType type;

    private List<@jakarta.validation.Valid ScheduleLineDto> lines;
}
