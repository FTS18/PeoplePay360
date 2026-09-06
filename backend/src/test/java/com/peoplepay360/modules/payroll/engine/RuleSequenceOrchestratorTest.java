package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.exception.PayrollCalculationException;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("RuleSequenceOrchestrator Unit Tests")
class RuleSequenceOrchestratorTest {

    private RuleSequenceOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        orchestrator = new RuleSequenceOrchestrator();
    }

    @Test
    @DisplayName("Sort and validate canonical rule pipeline: BASIC → ALLOWANCE → GROSS → DEDUCTION → NET")
    void testCanonicalSequenceSortingAndValidation() {
        // Pass out-of-order rules
        List<SalaryRule> unsortedRules = List.of(
                buildRule("NET", "Net Salary", SalaryRuleCategory.NET, 50),
                buildRule("HRA", "House Rent Allowance", SalaryRuleCategory.ALLOWANCE, 20),
                buildRule("BASIC", "Basic Salary", SalaryRuleCategory.BASIC, 10),
                buildRule("PF", "Provident Fund", SalaryRuleCategory.DEDUCTION, 40),
                buildRule("GROSS", "Gross Salary", SalaryRuleCategory.GROSS, 30)
        );

        List<SalaryRule> ordered = orchestrator.orderAndValidateRules(unsortedRules);

        assertThat(ordered).hasSize(5);
        assertThat(ordered.get(0).getCode()).isEqualTo("BASIC");
        assertThat(ordered.get(0).getCategory()).isEqualTo(SalaryRuleCategory.BASIC);
        assertThat(ordered.get(1).getCode()).isEqualTo("HRA");
        assertThat(ordered.get(1).getCategory()).isEqualTo(SalaryRuleCategory.ALLOWANCE);
        assertThat(ordered.get(2).getCode()).isEqualTo("GROSS");
        assertThat(ordered.get(2).getCategory()).isEqualTo(SalaryRuleCategory.GROSS);
        assertThat(ordered.get(3).getCode()).isEqualTo("PF");
        assertThat(ordered.get(3).getCategory()).isEqualTo(SalaryRuleCategory.DEDUCTION);
        assertThat(ordered.get(4).getCode()).isEqualTo("NET");
        assertThat(ordered.get(4).getCategory()).isEqualTo(SalaryRuleCategory.NET);
    }

    @Test
    @DisplayName("Throw exception when rule sequence violates category hierarchy (ALLOWANCE after DEDUCTION)")
    void testSequenceViolation_AllowanceAfterDeductionThrowsException() {
        List<SalaryRule> invalidRules = List.of(
                buildRule("BASIC", "Basic", SalaryRuleCategory.BASIC, 10),
                buildRule("PF", "Provident Fund", SalaryRuleCategory.DEDUCTION, 20),
                buildRule("BONUS", "Performance Bonus", SalaryRuleCategory.ALLOWANCE, 30) // Violation: rank 2 after rank 4
        );

        assertThatThrownBy(() -> orchestrator.orderAndValidateRules(invalidRules))
                .isInstanceOf(PayrollCalculationException.class)
                .hasMessageContaining("Salary rule sequence violation")
                .hasMessageContaining("ALLOWANCE cannot be executed after category rank 4");
    }

    @Test
    @DisplayName("Throw exception when rule sequence violates category hierarchy (BASIC after GROSS)")
    void testSequenceViolation_BasicAfterGrossThrowsException() {
        List<SalaryRule> invalidRules = List.of(
                buildRule("GROSS", "Gross", SalaryRuleCategory.GROSS, 10),
                buildRule("BASIC", "Basic", SalaryRuleCategory.BASIC, 20) // Violation: rank 1 after rank 3
        );

        assertThatThrownBy(() -> orchestrator.orderAndValidateRules(invalidRules))
                .isInstanceOf(PayrollCalculationException.class)
                .hasMessageContaining("Salary rule sequence violation")
                .hasMessageContaining("BASIC cannot be executed after category rank 3");
    }

    @Test
    @DisplayName("Throw exception when rules list is null or empty")
    void testEmptyRulesListThrowsException() {
        assertThatThrownBy(() -> orchestrator.orderAndValidateRules(null))
                .isInstanceOf(PayrollCalculationException.class)
                .hasMessageContaining("contains no active salary rules");

        assertThatThrownBy(() -> orchestrator.orderAndValidateRules(new ArrayList<>()))
                .isInstanceOf(PayrollCalculationException.class)
                .hasMessageContaining("contains no active salary rules");
    }

    private SalaryRule buildRule(String code, String name, SalaryRuleCategory category, int sequence) {
        return SalaryRule.builder()
                .code(code)
                .name(name)
                .category(category)
                .sequence(sequence)
                .computationType(ComputationType.FIXED)
                .fixedAmount(BigDecimal.valueOf(1000))
                .active(true)
                .build();
    }
}
