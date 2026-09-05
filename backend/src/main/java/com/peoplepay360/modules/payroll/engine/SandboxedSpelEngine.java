package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.modules.payroll.dto.PayrollInputEnvelope;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.SimpleEvaluationContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Sandboxed SpEL salary calculation engine.
 * Restricted to read-only data binding to prevent arbitrary code execution or reflection exploits.
 */
@Component
public class SandboxedSpelEngine {

    private final SpelExpressionParser parser = new SpelExpressionParser();

    public Map<String, BigDecimal> executeRules(
            List<SalaryRule> rules,
            PayrollInputEnvelope input
    ) {
        Map<String, Object> contextVariables = new HashMap<>();
        contextVariables.put("BASIC", input.getProratedBaseWage());
        contextVariables.put("WAGE", input.getBaseWage());
        contextVariables.put("HOURS_WORKED", input.getWorkedHours() != null ? input.getWorkedHours() : BigDecimal.ZERO);
        contextVariables.put("OT_HOURS", input.getOvertimeHours() != null ? input.getOvertimeHours() : BigDecimal.ZERO);
        contextVariables.put("UNPAID_DAYS", BigDecimal.valueOf(input.getUnpaidLeaveDays() != null ? input.getUnpaidLeaveDays() : 0));
        contextVariables.put("PAID_DAYS", BigDecimal.valueOf(input.getPaidLeaveDays() != null ? input.getPaidLeaveDays() : 0));
        contextVariables.put("STANDARD_HOURS", new BigDecimal("160.00"));

        EvaluationContext context = SimpleEvaluationContext
                .forReadOnlyDataBinding()
                .build();

        Map<String, BigDecimal> computedLines = new LinkedHashMap<>();

        for (SalaryRule rule : rules) {
            contextVariables.forEach(context::setVariable);

            if (rule.getFormula() == null || rule.getFormula().isBlank()) {
                continue;
            }

            Expression expression = parser.parseExpression(rule.getFormula());
            BigDecimal evaluated = expression.getValue(context, BigDecimal.class);

            evaluated = (evaluated == null)
                    ? BigDecimal.ZERO
                    : evaluated.setScale(2, RoundingMode.HALF_UP);

            computedLines.put(rule.getCode(), evaluated);
            contextVariables.put(rule.getCode(), evaluated);
        }

        return computedLines;
    }
}
