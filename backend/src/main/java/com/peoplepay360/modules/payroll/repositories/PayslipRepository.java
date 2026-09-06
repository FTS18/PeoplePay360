package com.peoplepay360.modules.payroll.repositories;

import com.peoplepay360.common.enums.PayslipStatus;
import com.peoplepay360.modules.payroll.entities.Payslip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID> {

    List<Payslip> findByPayrunId(UUID payrunId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Payslip p WHERE p.payrun.id = :payrunId")
    void deleteByPayrunId(@Param("payrunId") UUID payrunId);

    @EntityGraph(attributePaths = {"employee", "payrun"})
    Page<Payslip> findByPayrunId(UUID payrunId, Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "payrun"})
    Page<Payslip> findByEmployeeId(UUID employeeId, Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "payrun"})
    Page<Payslip> findByPayrunIdAndEmployeeId(UUID payrunId, UUID employeeId, Pageable pageable);

    @EntityGraph(attributePaths = {"employee", "payrun"})
    Page<Payslip> findByStatus(PayslipStatus status, Pageable pageable);

    long countByStatus(PayslipStatus status);

    // Returns (status, count) pairs in one GROUP BY query.
    @Query("SELECT p.status, COUNT(p) FROM Payslip p GROUP BY p.status")
    List<Object[]> countGroupedByStatus();

    @Query("SELECT p.status, COUNT(p) FROM Payslip p WHERE p.periodStart >= :sinceDate AND p.periodStart <= :untilDate GROUP BY p.status")
    List<Object[]> countGroupedByStatusBetween(
            @Param("sinceDate") LocalDate sinceDate,
            @Param("untilDate") LocalDate untilDate
    );

    @Override
    @EntityGraph(attributePaths = {"employee", "payrun"})
    Page<Payslip> findAll(Pageable pageable);

    boolean existsByPayrunIdAndEmployeeId(UUID payrunId, UUID employeeId);

    boolean existsByEmployeeIdAndPeriodStartAndPeriodEnd(
            UUID employeeId,
            LocalDate periodStart,
            LocalDate periodEnd
    );

    @Query("SELECT p FROM Payslip p " +
           "JOIN FETCH p.employee e " +
           "JOIN FETCH p.contract c " +
           "JOIN FETCH p.salaryStructure ss " +
           "LEFT JOIN FETCH p.lines " +
           "WHERE p.id = :id")
    Optional<Payslip> findWithDetailsById(@Param("id") UUID id);
}
