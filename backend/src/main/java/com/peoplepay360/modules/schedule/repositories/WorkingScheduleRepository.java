package com.peoplepay360.modules.schedule.repositories;

import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkingScheduleRepository extends JpaRepository<WorkingSchedule, UUID> {

    List<WorkingSchedule> findByActiveTrue();

    Optional<WorkingSchedule> findByIdAndActiveTrue(UUID id);

    @Query("SELECT ws FROM WorkingSchedule ws LEFT JOIN FETCH ws.lines WHERE ws.id = :id")
    Optional<WorkingSchedule> findWithLinesById(@Param("id") UUID id);

    @Query("SELECT DISTINCT ws FROM WorkingSchedule ws LEFT JOIN FETCH ws.lines")
    List<WorkingSchedule> findAllWithLines();
}
