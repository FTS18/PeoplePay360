package com.peoplepay360.modules.dashboard.repositories;

import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.payroll.entities.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardQueryRepository extends JpaRepository<Payslip, UUID> {

    interface DepartmentCostProjection {
        String getDepartment();
        Long getHeadcount();
        BigDecimal getTotalGross();
        BigDecimal getTotalNet();
    }

    interface MonthlyPayrollTrendProjection {
        LocalDate getPeriodStart();
        Long getPayslipCount();
        BigDecimal getTotalGross();
        BigDecimal getTotalNet();
    }

    // Combines SUM + AVG in one query, eliminating the zero-check retry pattern.
    interface PayrollAggregateProjection {
        BigDecimal getTotalNet();
        BigDecimal getAvgNet();
    }

    @Query("SELECT " +
           "c.department AS department, " +
           "COUNT(DISTINCT p.employee.id) AS headcount, " +
           "COALESCE(SUM(p.grossSalary), 0) AS totalGross, " +
           "COALESCE(SUM(p.netSalary), 0) AS totalNet " +
           "FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role) " +
           "GROUP BY c.department " +
           "ORDER BY totalNet DESC")
    List<DepartmentCostProjection> findDepartmentCostBreakdown(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT " +
           "c.department AS department, " +
           "COUNT(DISTINCT p.employee.id) AS headcount, " +
           "COALESCE(SUM(p.grossSalary), 0) AS totalGross, " +
           "COALESCE(SUM(p.netSalary), 0) AS totalNet " +
           "FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate AND p.periodStart <= :untilDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role) " +
           "GROUP BY c.department " +
           "ORDER BY totalNet DESC")
    List<DepartmentCostProjection> findDepartmentCostBreakdownBetween(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("untilDate") LocalDate untilDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT " +
           "p.periodStart AS periodStart, " +
           "COUNT(p.id) AS payslipCount, " +
           "COALESCE(SUM(p.grossSalary), 0) AS totalGross, " +
           "COALESCE(SUM(p.netSalary), 0) AS totalNet " +
           "FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role) " +
           "GROUP BY p.periodStart " +
           "ORDER BY p.periodStart ASC")
    List<MonthlyPayrollTrendProjection> findMonthlyPayrollTrends(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) AS totalNet, COALESCE(AVG(p.netSalary), 0) AS avgNet " +
           "FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role)")
    PayrollAggregateProjection getPayrollAggregates(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) AS totalNet, COALESCE(AVG(p.netSalary), 0) AS avgNet " +
           "FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate AND p.periodStart <= :untilDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role)")
    PayrollAggregateProjection getPayrollAggregatesBetween(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("untilDate") LocalDate untilDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT COUNT(a) FROM AttendanceRecord a " +
           "WHERE a.manualOverride = true " +
           "AND a.date >= :sinceDate " +
           "AND (:department IS NULL OR a.employee.department = :department) " +
           "AND (:role IS NULL OR a.employee.role = :role)")
    Long countManualOverrides(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role)")
    BigDecimal sumTotalNetSalaryPaid(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @Query("SELECT COALESCE(AVG(p.netSalary), 0) FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status = 'PAID' " +
           "AND p.periodStart >= :sinceDate " +
           "AND (:department IS NULL OR c.department = :department OR p.employee.department = :department) " +
           "AND (:role IS NULL OR p.employee.role = :role)")
    BigDecimal calculateAverageNetSalary(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("department") String department,
            @Param("role") com.peoplepay360.common.enums.Role role
    );

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_department_payroll_cost", nativeQuery = true)
    void refreshDepartmentCostView();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_payroll_summary", nativeQuery = true)
    void refreshMonthlySummaryView();
}
