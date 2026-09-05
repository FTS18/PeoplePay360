package com.peoplepay360.modules.timeoff.repositories;

import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.timeoff.entities.TimeOffAllocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    List<TimeOffAllocation> findByEmployeeIdOrderByValidFromDesc(UUID employeeId);

    Page<TimeOffAllocation> findByStatus(TimeOffStatus status, Pageable pageable);

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
}
