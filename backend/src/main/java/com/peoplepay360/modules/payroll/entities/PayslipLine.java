package com.peoplepay360.modules.payroll.entities;

import com.peoplepay360.common.BaseEntity;
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
    name = "payslip_lines",
    indexes = {
        @Index(name = "idx_payslip_lines_payslip", columnList = "payslip_id"),
        @Index(name = "idx_payslip_lines_category", columnList = "category")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayslipLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payslip_id", nullable = false)
    private Payslip payslip;

    @Column(name = "rule_code", nullable = false, length = 50)
    private String ruleCode;

    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private SalaryRuleCategory category;

    @Column(name = "sequence", nullable = false)
    private Integer sequence;

    @Column(name = "rate", precision = 5, scale = 2)
    private BigDecimal rate;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
