package com.peoplepay360.modules.payroll.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.PayrunStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "payruns",
    indexes = {
        @Index(name = "idx_payruns_period", columnList = "period_start, period_end"),
        @Index(name = "idx_payruns_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payrun extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private PayrunStatus status = PayrunStatus.DRAFT;

    @Column(name = "total_basic", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalBasic = BigDecimal.ZERO;

    @Column(name = "total_allowances", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalAllowances = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "total_net", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalNet = BigDecimal.ZERO;

    @Column(name = "payslips_count", nullable = false)
    @Builder.Default
    private Integer payslipsCount = 0;

    @Column(name = "validated_at")
    private Instant validatedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @OneToMany(mappedBy = "payrun", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payslip> payslips = new ArrayList<>();

    public void addPayslip(Payslip payslip) {
        payslips.add(payslip);
        payslip.setPayrun(this);
    }

    public void removePayslip(Payslip payslip) {
        payslips.remove(payslip);
        payslip.setPayrun(null);
    }
}
