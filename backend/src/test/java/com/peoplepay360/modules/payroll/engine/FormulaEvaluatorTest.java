package com.peoplepay360.modules.payroll.engine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("FormulaEvaluator Unit Tests")
class FormulaEvaluatorTest {

    private FormulaEvaluator evaluator;

    @BeforeEach
    void setUp() {
        evaluator = new FormulaEvaluator();
    }

    @Test
    @DisplayName("Evaluate arithmetic operator precedence with parentheses")
    void testBasicArithmeticAndPrecedence() {
        Map<String, BigDecimal> context = new HashMap<>();
        String formula = "(100 + 50) * 2 - 20 / 4";
        // (150) * 2 - 5 = 300 - 5 = 295.00
        BigDecimal result = evaluator.evaluate(formula, context);
        assertThat(result).isEqualByComparingTo(new BigDecimal("295.00"));
    }

    @Test
    @DisplayName("Evaluate formula resolving uppercase and lowercase context variables")
    void testContextVariableResolution() {
        Map<String, BigDecimal> context = new HashMap<>();
        context.put("BASIC", new BigDecimal("50000.00"));
        context.put("DA", new BigDecimal("5000.00"));

        String formula = "BASIC * 0.40 + DA";
        // 50000 * 0.40 + 5000 = 20000 + 5000 = 25000.00
        BigDecimal result = evaluator.evaluate(formula, context);
        assertThat(result).isEqualByComparingTo(new BigDecimal("25000.00"));
    }

    @Test
    @DisplayName("Evaluate division by zero gracefully returns zero without crashing")
    void testDivisionByZeroGracefulHandling() {
        Map<String, BigDecimal> context = new HashMap<>();
        context.put("BASIC", new BigDecimal("50000.00"));

        String formula = "BASIC / 0";
        BigDecimal result = evaluator.evaluate(formula, context);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("Evaluate nested parenthetical deduction expressions")
    void testNestedParentheticalFormula() {
        Map<String, BigDecimal> context = new HashMap<>();
        context.put("GROSS", new BigDecimal("75000.00"));
        context.put("BASIC", new BigDecimal("50000.00"));

        // PF is 12% of basic (6000), Taxable = 75000 - 6000 = 69000, 10% tax = 6900.00
        String formula = "(GROSS - (BASIC * 0.12)) * 0.10";
        BigDecimal result = evaluator.evaluate(formula, context);
        assertThat(result).isEqualByComparingTo(new BigDecimal("6900.00"));
    }

    @Test
    @DisplayName("Evaluate empty or null formula returns zero")
    void testNullOrBlankFormulaReturnsZero() {
        Map<String, BigDecimal> context = new HashMap<>();
        assertThat(evaluator.evaluate(null, context)).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(evaluator.evaluate("   ", context)).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
