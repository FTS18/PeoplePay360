package com.peoplepay360.modules.schedule.repositories;

import com.peoplepay360.modules.schedule.entities.WorkingScheduleLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkingScheduleLineRepository extends JpaRepository<WorkingScheduleLine, UUID> {

    List<WorkingScheduleLine> findByWorkingScheduleId(UUID workingScheduleId);

    Optional<WorkingScheduleLine> findByWorkingScheduleIdAndDayOfWeek(UUID workingScheduleId, DayOfWeek dayOfWeek);
}
