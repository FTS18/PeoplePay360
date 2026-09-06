package com.peoplepay360.modules.timeoff.repositories;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.timeoff.entities.TimeOffRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimeOffRequestRepository extends JpaRepository<TimeOffRequest, UUID> {

    @EntityGraph(attributePaths = {"employee", "timeOffType"})
    Page<TimeOffRequest> findByEmployeeIdOrderByStartDateDesc(UUID employeeId, Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "timeOffType"})
    Page<TimeOffRequest> findByStatus(TimeOffStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"employee", "timeOffType"})
    Page<TimeOffRequest> findAll(Pageable pageable);

    @Query("SELECT r FROM TimeOffRequest r " +
           "WHERE r.employee.id = :employeeId " +
           "AND r.status = 'APPROVED' " +
           "AND r.timeOffType.isPaid = :isPaid " +
           "AND r.startDate <= :periodEnd " +
           "AND r.endDate >= :periodStart")
    List<TimeOffRequest> findApprovedLeavesInWindow(
            @Param("employeeId") UUID employeeId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("isPaid") boolean isPaid
    );

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

    // Returns (typeId, sumTaken) pairs for all leave types for an employee in one GROUP BY query.
    @Query("SELECT r.timeOffType.id, COALESCE(SUM(r.requestedUnits), 0) FROM TimeOffRequest r " +
           "WHERE r.employee.id = :employeeId " +
           "AND r.status = 'APPROVED' " +
           "AND r.startDate >= :validFrom " +
           "AND r.endDate <= :validTo " +
           "GROUP BY r.timeOffType.id")
    List<Object[]> sumApprovedTakenUnitsGroupedByType(
            @Param("employeeId") UUID employeeId,
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

    // Returns (status, count) pairs in one GROUP BY query.
    @Query("SELECT r.status, COUNT(r) FROM TimeOffRequest r GROUP BY r.status")
    List<Object[]> countGroupedByStatus();

    @Query("SELECT r.status, COUNT(r) FROM TimeOffRequest r WHERE r.startDate >= :sinceDate AND r.startDate <= :untilDate GROUP BY r.status")
    List<Object[]> countGroupedByStatusBetween(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("untilDate") LocalDate untilDate
    );

    @Query("SELECT COUNT(r) FROM TimeOffRequest r " +
           "WHERE r.employee.id = :employeeId " +
           "AND r.status = 'CONFIRM' " +
           "AND r.startDate <= :periodEnd " +
           "AND r.endDate >= :periodStart")
    long countPendingRequestsInWindow(
            @Param("employeeId") UUID employeeId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    // Bulk variant: fetches all approved leaves for a set of employees in one query.
    @Query("SELECT r FROM TimeOffRequest r " +
           "JOIN FETCH r.timeOffType " +
           "WHERE r.employee.id IN :employeeIds " +
           "AND r.status = 'APPROVED' " +
           "AND r.startDate <= :periodEnd " +
           "AND r.endDate >= :periodStart")
    List<TimeOffRequest> findApprovedLeavesInWindowBulk(
            @Param("employeeIds") List<UUID> employeeIds,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );
}
