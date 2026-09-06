package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.PayrunStatus;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;

import static com.peoplepay360.modules.payroll.engine.SalaryEngineTestDataFactory.*;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SalaryCalculationEngine Proration & Boundary Tests")
class SalaryProrationEngineTest {

    private SalaryCalculationEngine engine;

    @BeforeEach
    void setUp() {
        RuleSequenceOrchestrator orchestrator = new RuleSequenceOrchestrator();
        FormulaEvaluator formulaEvaluator = new FormulaEvaluator();
        engine = new SalaryCalculationEngine(orchestrator, formulaEvaluator);
    }

    @Test
    @DisplayName("Proration Edge Case: Mid-month joiner with shift schedule calculates exact shift-hour ratio")
    void testProration_MidMonthJoinerWithShiftSchedule() {
        // September 2026: 30 days total
        // Working days (Mon-Fri) in Sep 2026 = 22 days = 176 shift hours
        // Contract starts on Sep 16, 2026 (Wed) -> 11 working days = 88 shift hours
        // Proration ratio = 88 / 176 = 0.500000 exactly
        LocalDate periodStart = LocalDate.of(2026, 9, 1);
        LocalDate periodEnd = LocalDate.of(2026, 9, 30);
        LocalDate contractStart = LocalDate.of(2026, 9, 16);

        WorkingSchedule schedule = buildStandardMondayToFridaySchedule();
        Employee employee = buildEmployee("EMP002", "Priya", "Patel", schedule);
        Contract contract = buildContract(employee, new BigDecimal("60000.00"), contractStart, null);

        SalaryStructure structure = SalaryStructure.builder()
                .name("Prorated Structure")
                .code("PRORATED_STD")
                .active(true)
                .rules(new ArrayList<>())
                .build();

        structure.addRule(SalaryRule.builder()
                .code("BASIC")
                .name("Basic")
                .category(SalaryRuleCategory.BASIC)
                .sequence(10)
                .computationType(ComputationType.FORMULA)
                .formula("PRORATED_WAGE")
                .active(true)
                .build());

        structure.addRule(SalaryRule.builder()
                .code("HRA")
                .name("HRA")
                .category(SalaryRuleCategory.ALLOWANCE)
                .sequence(20)
                .computationType(ComputationType.PERCENTAGE)
                .percentageBaseCode("BASIC")
                .percentage(new BigDecimal("40.00"))
                .active(true)
                .build());

        structure.addRule(SalaryRule.builder()
                .code("PF")
                .name("PF")
                .category(SalaryRuleCategory.DEDUCTION)
                .sequence(30)
                .computationType(ComputationType.PERCENTAGE)
                .percentageBaseCode("BASIC")
                .percentage(new BigDecimal("12.00"))
                .active(true)
                .build());

        Payrun payrun = Payrun.builder()
                .name("Payrun Sep 2026")
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .salaryStructure(structure)
                .status(PayrunStatus.DRAFT)
                .build();

        Payslip payslip = engine.computePayslip(payrun, employee, contract, structure, 11);

        // 60,000 * 0.50 = 30,000.00 prorated wage
        assertThat(payslip.getBasicWage()).isEqualByComparingTo(new BigDecimal("30000.00"));
        assertThat(payslip.getGrossSalary()).isEqualByComparingTo(new BigDecimal("42000.00"));
        assertThat(payslip.getTotalAllowances()).isEqualByComparingTo(new BigDecimal("12000.00"));
        assertThat(payslip.getTotalDeductions()).isEqualByComparingTo(new BigDecimal("3600.00"));
        assertThat(payslip.getNetSalary()).isEqualByComparingTo(new BigDecimal("38400.00"));
    }

    @Test
    @DisplayName("Proration Fallback: Calendar days fallback when working schedule has no shift hours")
    void testProration_CalendarDaysFallbackWhenNoSchedule() {
        LocalDate periodStart = LocalDate.of(2026, 9, 1);
        LocalDate periodEnd = LocalDate.of(2026, 9, 30);
        LocalDate contractStart = LocalDate.of(2026, 9, 16);

        Employee employee = buildEmployee("EMP003", "Karan", "Mehta", null);
        Contract contract = buildContract(employee, new BigDecimal("100000.00"), contractStart, null);

        SalaryStructure structure = SalaryStructure.builder()
                .name("Standard")
                .code("STD")
                .active(true)
                .rules(new ArrayList<>())
                .build();

        structure.addRule(SalaryRule.builder()
                .code("BASIC")
                .name("Basic")
                .category(SalaryRuleCategory.BASIC)
                .sequence(10)
                .computationType(ComputationType.FORMULA)
                .formula("PRORATED_WAGE")
                .active(true)
                .build());

        Payrun payrun = Payrun.builder()
                .name("Payrun Sep 2026")
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .salaryStructure(structure)
                .build();

        Payslip payslip = engine.computePayslip(payrun, employee, contract, structure, 15);

        // Fallback: null schedule defaults to 8h/day (15 days * 8h = 120h / 240h = 0.50)
        assertThat(payslip.getBasicWage()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(payslip.getNetSalary()).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    @DisplayName("Zero Floor Guard: Deductions exceeding gross salary result in zero net salary rather than negative")
    void testZeroNetPayFloor_DeductionsExceedingGross() {
        LocalDate periodStart = LocalDate.of(2026, 9, 1);
        LocalDate periodEnd = LocalDate.of(2026, 9, 30);

        WorkingSchedule schedule = buildStandardMondayToFridaySchedule();
        Employee employee = buildEmployee("EMP004", "Deepak", "Verma", schedule);
        Contract contract = buildContract(employee, new BigDecimal("10000.00"), LocalDate.of(2026, 1, 1), null);

        SalaryStructure structure = SalaryStructure.builder()
                .name("High Deduction Structure")
                .code("HIGH_DED")
                .active(true)
                .rules(new ArrayList<>())
                .build();

        structure.addRule(SalaryRule.builder()
                .code("BASIC")
                .name("Basic")
                .category(SalaryRuleCategory.BASIC)
                .sequence(10)
                .computationType(ComputationType.FIXED)
                .fixedAmount(new BigDecimal("10000.00"))
                .active(true)
                .build());

        structure.addRule(SalaryRule.builder()
                .code("RECOVERY")
                .name("Advance Loan Recovery")
                .category(SalaryRuleCategory.DEDUCTION)
                .sequence(20)
                .computationType(ComputationType.FIXED)
                .fixedAmount(new BigDecimal("15000.00"))
                .active(true)
                .build());

        Payrun payrun = Payrun.builder()
                .name("Payrun Sep 2026")
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .salaryStructure(structure)
                .build();

        Payslip payslip = engine.computePayslip(payrun, employee, contract, structure, 22);

        assertThat(payslip.getGrossSalary()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(payslip.getTotalDeductions()).isEqualByComparingTo(new BigDecimal("15000.00"));
        assertThat(payslip.getNetSalary()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
