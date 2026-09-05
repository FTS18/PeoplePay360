package com.peoplepay360.modules.payroll.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "salary_rules",
    indexes = {
        @Index(name = "idx_rules_structure_seq", columnList = "salary_structure_id, sequence")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private SalaryRuleCategory category;

    @Column(name = "sequence", nullable = false)
    private Integer sequence;

    @Enumerated(EnumType.STRING)
    @Column(name = "computation_type", nullable = false, length = 30)
    private ComputationType computationType;

    @Column(name = "fixed_amount", precision = 12, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "percentage_base_code", length = 50)
    private String percentageBaseCode;

    @Column(name = "formula", columnDefinition = "TEXT")
    private String formula;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
