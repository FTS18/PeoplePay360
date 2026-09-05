package com.peoplepay360.modules.attendance.repositories;

import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
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
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    @EntityGraph(attributePaths = {"employee", "reviewedBy"})
    Optional<AttendanceRecord> findByEmployeeIdAndDate(UUID employeeId, LocalDate date);

    @EntityGraph(attributePaths = {"employee", "reviewedBy"})
    Page<AttendanceRecord> findByEmployeeIdOrderByDateDesc(UUID employeeId, Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "reviewedBy"})
    List<AttendanceRecord> findByEmployeeIdAndDateBetweenOrderByDateAsc(
            UUID employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    @EntityGraph(attributePaths = {"employee", "reviewedBy"})
    Page<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"employee", "reviewedBy"})
    Page<AttendanceRecord> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "reviewedBy"})
    Page<AttendanceRecord> findAllByOrderByDateDesc(Pageable pageable);

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

    // Bulk variant: returns (employeeId, count) pairs for the entire employee set in one query.
    @Query("SELECT a.employee.id, COUNT(a) FROM AttendanceRecord a " +
           "WHERE a.employee.id IN :employeeIds " +
           "AND a.date BETWEEN :startDate AND :endDate " +
           "AND a.status IN ('PRESENT', 'HALF_DAY', 'LATE') " +
           "GROUP BY a.employee.id")
    List<Object[]> countWorkedDaysBulk(
            @Param("employeeIds") List<UUID> employeeIds,
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

    long countByStatus(AttendanceStatus status);
    long countByManualOverride(boolean manualOverride);

    // Returns (status, count) pairs for all statuses in one GROUP BY query.
    @Query("SELECT a.status, COUNT(a) FROM AttendanceRecord a GROUP BY a.status")
    List<Object[]> countGroupedByStatus();

    // Used by LeaveLedgerService to pre-fetch existing records before batch-inserting leave attendance.
    List<AttendanceRecord> findByEmployeeIdAndDateBetween(UUID employeeId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a " +
           "WHERE a.employee.id = :employeeId " +
           "AND a.date BETWEEN :startDate AND :endDate " +
           "AND (a.status = 'EXCEPTION' OR (a.checkIn IS NOT NULL AND a.checkOut IS NULL AND a.date < CURRENT_DATE))")
    long countAnomaliesForEmployeeInPeriod(
            @Param("employeeId") UUID employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    interface AttendanceStatsProjection {
        Long getTotalEntries();
        Long getPresentCount();
        Long getExceptionCount();
        BigDecimal getTotalWorkedHours();
    }

    @Query("SELECT " +
           "COUNT(a) AS totalEntries, " +
           "COALESCE(SUM(CASE WHEN a.status = 'PRESENT' THEN 1L ELSE 0L END), 0L) AS presentCount, " +
           "COALESCE(SUM(CASE WHEN (a.status IN ('EXCEPTION', 'HALF_DAY', 'LATE') OR a.manualOverride = true) THEN 1L ELSE 0L END), 0L) AS exceptionCount, " +
           "COALESCE(SUM(a.workedHours), 0) AS totalWorkedHours " +
           "FROM AttendanceRecord a " +
           "WHERE (:employeeId IS NULL OR a.employee.id = :employeeId)")
    AttendanceStatsProjection getAttendanceStatsAggregated(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE (:employeeId IS NULL OR a.employee.id = :employeeId)")
    long countTotalRecords(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE (:employeeId IS NULL OR a.employee.id = :employeeId) AND a.status = 'PRESENT'")
    long countPresentRecords(@Param("employeeId") UUID employeeId);

    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE (:employeeId IS NULL OR a.employee.id = :employeeId) AND (a.status IN ('EXCEPTION', 'HALF_DAY', 'LATE') OR a.manualOverride = true)")
    long countExceptionRecords(@Param("employeeId") UUID employeeId);

    @Query("SELECT COALESCE(SUM(a.workedHours), 0) FROM AttendanceRecord a WHERE (:employeeId IS NULL OR a.employee.id = :employeeId)")
    BigDecimal sumTotalWorkedHoursAll(@Param("employeeId") UUID employeeId);
}

