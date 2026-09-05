package com.peoplepay360.modules.schedule.controllers;

import com.peoplepay360.common.ApiResponse;
import com.peoplepay360.modules.schedule.dto.requests.CreateScheduleRequest;
import com.peoplepay360.modules.schedule.dto.responses.ScheduleResponse;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.entities.WorkingScheduleLine;
import com.peoplepay360.modules.schedule.services.WorkingScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class WorkingScheduleController {

    private final WorkingScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getAllSchedules() {
        List<WorkingSchedule> schedules = scheduleService.getAllSchedules();
        List<ScheduleResponse> responses = schedules.stream().map(ScheduleResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getScheduleById(@PathVariable UUID id) {
        WorkingSchedule schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(ApiResponse.ok(ScheduleResponse.from(schedule)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
        WorkingSchedule schedule = WorkingSchedule.builder()
                .name(request.getName())
                .type(request.getType())
                .lines(new ArrayList<>())
                .build();

        if (request.getLines() != null) {
            for (var lineDto : request.getLines()) {
                WorkingScheduleLine line = WorkingScheduleLine.builder()
                        .dayOfWeek(lineDto.getDayOfWeek())
                        .startTime(lineDto.getStartTime())
                        .endTime(lineDto.getEndTime())
                        .breakHours(lineDto.getBreakHours())
                        .build();
                schedule.addLine(line);
            }
        }

        WorkingSchedule saved = scheduleService.saveSchedule(schedule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Working schedule created", ScheduleResponse.from(saved)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @PathVariable UUID id,
            @Valid @RequestBody CreateScheduleRequest request
    ) {
        WorkingSchedule existing = scheduleService.getScheduleById(id);
        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.getLines().clear();

        if (request.getLines() != null) {
            for (var lineDto : request.getLines()) {
                WorkingScheduleLine line = WorkingScheduleLine.builder()
                        .dayOfWeek(lineDto.getDayOfWeek())
                        .startTime(lineDto.getStartTime())
                        .endTime(lineDto.getEndTime())
                        .breakHours(lineDto.getBreakHours())
                        .build();
                existing.addLine(line);
            }
        }

        WorkingSchedule updated = scheduleService.saveSchedule(existing);
        return ResponseEntity.ok(ApiResponse.ok("Working schedule updated", ScheduleResponse.from(updated)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable UUID id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.ok("Working schedule deleted", null));
    }
}
