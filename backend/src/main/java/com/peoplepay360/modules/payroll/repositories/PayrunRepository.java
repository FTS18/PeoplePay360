package com.peoplepay360.modules.payroll.repositories;

import com.peoplepay360.common.enums.PayrunStatus;
import com.peoplepay360.modules.payroll.entities.Payrun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrunRepository extends JpaRepository<Payrun, UUID> {

    Page<Payrun> findByStatus(PayrunStatus status, Pageable pageable);

    @Query(value = "SELECT p FROM Payrun p LEFT JOIN FETCH p.salaryStructure",
           countQuery = "SELECT COUNT(p) FROM Payrun p")
    Page<Payrun> findAllWithStructure(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Payrun p " +
           "LEFT JOIN FETCH p.salaryStructure " +
           "LEFT JOIN FETCH p.payslips " +
           "WHERE p.id = :id")
    Optional<Payrun> findWithPayslipsById(@Param("id") UUID id);

    @Query("SELECT COUNT(p) > 0 FROM Payrun p " +
           "WHERE p.salaryStructure.id = :structureId " +
           "AND p.status != 'CANCELLED' " +
           "AND (:excludeId IS NULL OR p.id != :excludeId) " +
           "AND p.periodStart <= :newEnd " +
           "AND p.periodEnd >= :newStart")
    boolean existsOverlappingPayrun(
            @Param("structureId") UUID structureId,
            @Param("excludeId") UUID excludeId,
            @Param("newStart") LocalDate newStart,
            @Param("newEnd") LocalDate newEnd
    );

    long countByStatus(PayrunStatus status);
}
