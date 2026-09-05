package com.peoplepay360.modules.payroll.repositories;

import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, UUID> {

    List<SalaryStructure> findByActiveTrue();

    Optional<SalaryStructure> findByCode(String code);

    boolean existsByCode(String code);

    @Query("SELECT DISTINCT s FROM SalaryStructure s " +
           "LEFT JOIN FETCH s.rules r " +
           "WHERE s.id = :id AND (r IS NULL OR r.active = true)")
    Optional<SalaryStructure> findWithActiveRulesById(@Param("id") UUID id);

    @Query("SELECT DISTINCT s FROM SalaryStructure s " +
           "LEFT JOIN FETCH s.rules r " +
           "ORDER BY s.name")
    List<SalaryStructure> findAllWithRules();
}
