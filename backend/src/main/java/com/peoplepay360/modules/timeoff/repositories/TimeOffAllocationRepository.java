package com.peoplepay360.modules.timeoff.repositories;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.timeoff.entities.TimeOffAllocation;
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
public interface TimeOffAllocationRepository extends JpaRepository<TimeOffAllocation, UUID> {

    @EntityGraph(attributePaths = {"employee", "timeOffType", "approver"})
    List<TimeOffAllocation> findByEmployeeIdOrderByValidFromDesc(UUID employeeId);

    @EntityGraph(attributePaths = {"employee", "timeOffType", "approver"})
    Page<TimeOffAllocation> findByEmployeeIdOrderByValidFromDesc(UUID employeeId, Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "timeOffType", "approver"})
    Page<TimeOffAllocation> findByStatus(TimeOffStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"employee", "timeOffType", "approver"})
    Page<TimeOffAllocation> findAll(Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.allocatedUnits), 0) FROM TimeOffAllocation a " +
           "WHERE a.employee.id = :employeeId " +
           "AND a.timeOffType.id = :typeId " +
           "AND a.status = 'APPROVED' " +
           "AND a.validFrom <= :date " +
           "AND a.validTo >= :date")
    BigDecimal sumApprovedAllocations(
            @Param("employeeId") UUID employeeId,
            @Param("typeId") UUID typeId,
            @Param("date") LocalDate date
    );

    // Returns (typeId, sumAllocated) pairs for all leave types for an employee in one GROUP BY query.
    @Query("SELECT a.timeOffType.id, COALESCE(SUM(a.allocatedUnits), 0) FROM TimeOffAllocation a " +
           "WHERE a.employee.id = :employeeId " +
           "AND a.status = 'APPROVED' " +
           "AND a.validFrom <= :date " +
           "AND a.validTo >= :date " +
           "GROUP BY a.timeOffType.id")
    List<Object[]> sumApprovedAllocationsGroupedByType(
            @Param("employeeId") UUID employeeId,
            @Param("date") LocalDate date
    );
}
