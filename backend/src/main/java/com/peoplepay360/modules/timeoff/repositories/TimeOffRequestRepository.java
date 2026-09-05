package com.peoplepay360.modules.timeoff.repositories;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.timeoff.entities.TimeOffRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface TimeOffRequestRepository extends JpaRepository<TimeOffRequest, UUID> {

    Page<TimeOffRequest> findByEmployeeIdOrderByStartDateDesc(UUID employeeId, Pageable pageable);

    Page<TimeOffRequest> findByStatus(TimeOffStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.requestedUnits), 0) FROM TimeOffRequest r " +
           "WHERE r.employee.id = :employeeId " +
           "AND r.timeOffType.id = :typeId " +
           "AND r.status = 'APPROVED' " +
           "AND r.startDate >= :validFrom " +
           "AND r.endDate <= :validTo")
    BigDecimal sumApprovedTakenUnits(
            @Param("employeeId") UUID employeeId,
            @Param("typeId") UUID typeId,
            @Param("validFrom") LocalDate validFrom,
            @Param("validTo") LocalDate validTo
    );

    @Query("SELECT COUNT(r) > 0 FROM TimeOffRequest r " +
           "WHERE r.employee.id = :employeeId " +
           "AND r.status IN ('CONFIRM', 'APPROVED') " +
           "AND (:excludeId IS NULL OR r.id != :excludeId) " +
           "AND r.startDate <= :newEnd " +
           "AND r.endDate >= :newStart")
    boolean existsOverlappingRequest(
            @Param("employeeId") UUID employeeId,
            @Param("excludeId") UUID excludeId,
            @Param("newStart") LocalDate newStart,
            @Param("newEnd") LocalDate newEnd
    );

    long countByStatus(TimeOffStatus status);
}
