package com.peoplepay360.modules.attendance.repositories;

import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findByEmployeeIdAndDate(UUID employeeId, LocalDate date);

    Page<AttendanceRecord> findByEmployeeIdOrderByDateDesc(UUID employeeId, Pageable pageable);

    List<AttendanceRecord> findByEmployeeIdAndDateBetweenOrderByDateAsc(
            UUID employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    Page<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.workedHours), 0) FROM AttendanceRecord a " +
           "WHERE a.employee.id = :employeeId " +
           "AND a.date BETWEEN :startDate AND :endDate " +
           "AND a.status != 'ABSENT'")
    BigDecimal sumWorkedHoursInPeriod(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(a) FROM AttendanceRecord a " +
           "WHERE a.employee.id = :employeeId " +
           "AND a.date BETWEEN :startDate AND :endDate " +
           "AND a.status IN ('PRESENT', 'HALF_DAY', 'LATE')")
    int countWorkedDaysInPeriod(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT a FROM AttendanceRecord a " +
           "JOIN FETCH a.employee e " +
           "WHERE a.date BETWEEN :startDate AND :endDate " +
           "AND (a.status = 'EXCEPTION' OR (a.checkIn IS NOT NULL AND a.checkOut IS NULL AND a.date < CURRENT_DATE))")
    Page<AttendanceRecord> findAnomaliesInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);
}
