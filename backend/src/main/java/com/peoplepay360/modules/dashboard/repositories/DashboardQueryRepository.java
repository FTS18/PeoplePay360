package com.peoplepay360.modules.dashboard.repositories;

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

    @Query("SELECT " +
           "c.department AS department, " +
           "COUNT(DISTINCT p.employee.id) AS headcount, " +
           "COALESCE(SUM(p.grossSalary), 0) AS totalGross, " +
           "COALESCE(SUM(p.netSalary), 0) AS totalNet " +
           "FROM Payslip p " +
           "JOIN p.contract c " +
           "WHERE p.status IN ('VALIDATED', 'PAID') " +
           "AND p.periodStart >= :sinceDate " +
           "GROUP BY c.department " +
           "ORDER BY totalNet DESC")
    List<DepartmentCostProjection> findDepartmentCostBreakdown(@Param("sinceDate") LocalDate sinceDate);

    @Query("SELECT " +
           "p.periodStart AS periodStart, " +
           "COUNT(p.id) AS payslipCount, " +
           "COALESCE(SUM(p.grossSalary), 0) AS totalGross, " +
           "COALESCE(SUM(p.netSalary), 0) AS totalNet " +
           "FROM Payslip p " +
           "WHERE p.status IN ('VALIDATED', 'PAID') " +
           "AND p.periodStart >= :sinceDate " +
           "GROUP BY p.periodStart " +
           "ORDER BY p.periodStart ASC")
    List<MonthlyPayrollTrendProjection> findMonthlyPayrollTrends(@Param("sinceDate") LocalDate sinceDate);

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM Payslip p " +
           "WHERE p.status IN ('VALIDATED', 'PAID') AND p.periodStart >= :sinceDate")
    BigDecimal sumTotalNetSalaryPaid(@Param("sinceDate") LocalDate sinceDate);

    @Query("SELECT COALESCE(AVG(p.netSalary), 0) FROM Payslip p " +
           "WHERE p.status IN ('VALIDATED', 'PAID') AND p.periodStart >= :sinceDate")
    BigDecimal calculateAverageNetSalary(@Param("sinceDate") LocalDate sinceDate);
}
