package com.peoplepay360.modules.payroll.repositories;

import com.peoplepay360.modules.payroll.entities.SalaryRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryRuleRepository extends JpaRepository<SalaryRule, UUID> {

    List<SalaryRule> findBySalaryStructureIdOrderBySequenceAsc(UUID salaryStructureId);

    List<SalaryRule> findBySalaryStructureIdAndActiveTrueOrderBySequenceAsc(UUID salaryStructureId);

    Optional<SalaryRule> findBySalaryStructureIdAndCode(UUID salaryStructureId, String code);

    boolean existsBySalaryStructureIdAndCode(UUID salaryStructureId, String code);
}
