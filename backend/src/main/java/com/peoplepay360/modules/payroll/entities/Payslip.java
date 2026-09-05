package com.peoplepay360.modules.payroll.entities;

import com.peoplepay360.common.BaseEntity;
import com.peoplepay360.common.enums.PayslipStatus;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.employee.entities.Employee;
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
import jakarta.persistence.OrderBy;
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
    name = "payslips",
    indexes = {
        @Index(name = "idx_payslips_payrun", columnList = "payrun_id"),
        @Index(name = "idx_payslips_emp_period", columnList = "employee_id, period_start, period_end"),
        @Index(name = "idx_payslips_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payslip extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payrun_id", nullable = false)
    private Payrun payrun;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "worked_days", nullable = false)
    @Builder.Default
    private Integer workedDays = 0;

    @Column(name = "basic_wage", nullable = false, precision = 12, scale = 2)
    private BigDecimal basicWage;

    @Column(name = "gross_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal grossSalary = BigDecimal.ZERO;

    @Column(name = "total_allowances", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAllowances = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private PayslipStatus status = PayslipStatus.DRAFT;

    @Column(name = "pdf_generated", nullable = false)
    @Builder.Default
    private boolean pdfGenerated = false;

    @Column(name = "email_sent", nullable = false)
    @Builder.Default
    private boolean emailSent = false;

    @Column(name = "email_sent_at")
    private Instant emailSentAt;

    @OneToMany(mappedBy = "payslip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    @org.hibernate.annotations.BatchSize(size = 50)
    @Builder.Default
    private List<PayslipLine> lines = new ArrayList<>();

    public void addLine(PayslipLine line) {
        lines.add(line);
        line.setPayslip(this);
    }

    public void removeLine(PayslipLine line) {
        lines.remove(line);
        line.setPayslip(null);
    }
}
