package com.peoplepay360.modules.payroll.repositories;

import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.modules.payroll.entities.PayslipLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayslipLineRepository extends JpaRepository<PayslipLine, UUID> {

    List<PayslipLine> findByPayslipIdOrderBySequenceAsc(UUID payslipId);

    List<PayslipLine> findByPayslipIdAndCategoryOrderBySequenceAsc(
            UUID payslipId,
            SalaryRuleCategory category
    );
}
