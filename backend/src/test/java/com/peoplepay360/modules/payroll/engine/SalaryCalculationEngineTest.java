package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.PayrunStatus;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.entities.PayslipLine;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static com.peoplepay360.modules.payroll.engine.SalaryEngineTestDataFactory.*;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SalaryCalculationEngine Lifecycle Tests")
class SalaryCalculationEngineTest {

    private SalaryCalculationEngine engine;

    @BeforeEach
    void setUp() {
        RuleSequenceOrchestrator orchestrator = new RuleSequenceOrchestrator();
        FormulaEvaluator formulaEvaluator = new FormulaEvaluator();
        engine = new SalaryCalculationEngine(orchestrator, formulaEvaluator);
    }

    @Test
    @DisplayName("Full Payslip Lifecycle: sequential execution of BASIC → ALLOWANCE → GROSS → DEDUCTION → NET")
    void testFullPayslipCalculationLifecycle() {
        LocalDate periodStart = LocalDate.of(2026, 9, 1);
        LocalDate periodEnd = LocalDate.of(2026, 9, 30);

        WorkingSchedule schedule = buildStandardMondayToFridaySchedule();
        Employee employee = buildEmployee("EMP001", "Arun", "Sharma", schedule);
        Contract contract = buildContract(employee, new BigDecimal("50000.00"), LocalDate.of(2026, 1, 1), null);

        SalaryStructure structure = SalaryStructure.builder()
                .name("Corporate Standard Structure")
                .code("CORP_STD")
                .active(true)
                .rules(new ArrayList<>())
                .build();

        // 1. BASIC (Rank 1)
        structure.addRule(SalaryRule.builder()
                .code("BASIC")
                .name("Basic Salary")
                .category(SalaryRuleCategory.BASIC)
                .sequence(10)
                .computationType(ComputationType.FORMULA)
                .formula("PRORATED_WAGE")
                .active(true)
                .build());

        // 2. ALLOWANCE (Rank 2) - HRA: 40% of BASIC
        structure.addRule(SalaryRule.builder()
                .code("HRA")
                .name("House Rent Allowance")
                .category(SalaryRuleCategory.ALLOWANCE)
                .sequence(20)
                .computationType(ComputationType.PERCENTAGE)
                .percentageBaseCode("BASIC")
                .percentage(new BigDecimal("40.00"))
                .active(true)
                .build());

        // 3. ALLOWANCE (Rank 2) - Conveyance: Fixed 5000
        structure.addRule(SalaryRule.builder()
                .code("CONVEYANCE")
                .name("Conveyance Allowance")
                .category(SalaryRuleCategory.ALLOWANCE)
                .sequence(25)
                .computationType(ComputationType.FIXED)
                .fixedAmount(new BigDecimal("5000.00"))
                .active(true)
                .build());

        // 4. DEDUCTION (Rank 4) - PF: 12% of BASIC
        structure.addRule(SalaryRule.builder()
                .code("PF")
                .name("Provident Fund")
                .category(SalaryRuleCategory.DEDUCTION)
                .sequence(30)
                .computationType(ComputationType.PERCENTAGE)
                .percentageBaseCode("BASIC")
                .percentage(new BigDecimal("12.00"))
                .active(true)
                .build());

        // 5. DEDUCTION (Rank 4) - Professional Tax: Fixed 200
        structure.addRule(SalaryRule.builder()
                .code("PT")
                .name("Professional Tax")
                .category(SalaryRuleCategory.DEDUCTION)
                .sequence(35)
                .computationType(ComputationType.FIXED)
                .fixedAmount(new BigDecimal("200.00"))
                .active(true)
                .build());

        Payrun payrun = Payrun.builder()
                .name("Payrun Sep 2026")
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .salaryStructure(structure)
                .status(PayrunStatus.DRAFT)
                .build();

        Payslip payslip = engine.computePayslip(payrun, employee, contract, structure, 22);

        // Assert deterministic mathematical totals
        assertThat(payslip.getBasicWage()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(payslip.getGrossSalary()).isEqualByComparingTo(new BigDecimal("75000.00"));
        assertThat(payslip.getTotalAllowances()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(payslip.getTotalDeductions()).isEqualByComparingTo(new BigDecimal("6200.00"));
        assertThat(payslip.getNetSalary()).isEqualByComparingTo(new BigDecimal("68800.00"));

        List<PayslipLine> lines = payslip.getLines();
        assertThat(lines).hasSize(5);

        assertThat(findLine(lines, "BASIC").getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(findLine(lines, "HRA").getAmount()).isEqualByComparingTo(new BigDecimal("20000.00"));
        assertThat(findLine(lines, "CONVEYANCE").getAmount()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(findLine(lines, "PF").getAmount()).isEqualByComparingTo(new BigDecimal("6000.00"));
        assertThat(findLine(lines, "PT").getAmount()).isEqualByComparingTo(new BigDecimal("200.00"));
    }
}
