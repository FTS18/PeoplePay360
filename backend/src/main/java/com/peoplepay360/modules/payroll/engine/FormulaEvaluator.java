package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.exception.PayrollCalculationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.SimpleEvaluationContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class FormulaEvaluator {

    private static final Pattern TOKEN_PATTERN = Pattern.compile("\\s*([A-Za-z_][A-Za-z0-9_]*|\\d+(\\.\\d+)?|[+\\-*/()])\\s*");
    private static final Pattern DISALLOWED_SPEL_KEYWORDS = Pattern.compile("(?i)\\b(T\\(|new\\s|java\\.lang|System|Runtime|ProcessBuilder|Class|ClassLoader)\\b");
    private final SpelExpressionParser spelParser = new SpelExpressionParser();

    public BigDecimal evaluate(String formula, Map<String, BigDecimal> context) {
        if (formula == null || formula.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        if (DISALLOWED_SPEL_KEYWORDS.matcher(formula).find()) {
            log.warn("Security Guard: Disallowed keyword detected in formula '{}'. Falling back to safe infix math evaluator.", formula);
            formula = formula.replaceAll("(?i)\\b(T\\(|new\\s|java\\.lang|System|Runtime|ProcessBuilder|Class|ClassLoader)\\b", "");
        }

        // 1. Try SpEL expression parsing for conditionals, functions, and standard formulas
        try {
            EvaluationContext spelContext = SimpleEvaluationContext.forReadOnlyDataBinding().build();
            context.forEach((k, v) -> {
                spelContext.setVariable(k, v);
                spelContext.setVariable(k.toLowerCase(), v);
            });

            Expression expression = spelParser.parseExpression(formula);
            Object result = expression.getValue(spelContext);

            if (result instanceof BigDecimal bd) {
                return bd.setScale(2, RoundingMode.HALF_UP);
            } else if (result instanceof Number num) {
                return BigDecimal.valueOf(num.doubleValue()).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            // SpEL cannot parse this formula syntax — fall back to the token infix evaluator.
            log.warn("SpEL evaluation failed for formula '{}': {}. Falling back to infix evaluator.", formula, e.getMessage());
        }

        // 2. Token infix math evaluator fallback
        Deque<BigDecimal> values = new ArrayDeque<>();
        Deque<Character> operators = new ArrayDeque<>();
        Matcher matcher = TOKEN_PATTERN.matcher(formula);

        try {
            while (matcher.find()) {
                String token = matcher.group(1);
                if (token.isEmpty()) continue;

                char firstChar = token.charAt(0);
                if (Character.isLetter(firstChar) || firstChar == '_') {
                    BigDecimal varValue = context.getOrDefault(token.toUpperCase(), BigDecimal.ZERO);
                    values.push(varValue);
                } else if (Character.isDigit(firstChar)) {
                    values.push(new BigDecimal(token));
                } else if (firstChar == '(') {
                    operators.push('(');
                } else if (firstChar == ')') {
                    while (!operators.isEmpty() && operators.peek() != '(') {
                        values.push(applyOp(operators.pop(), values.pop(), values.pop()));
                    }
                    if (!operators.isEmpty() && operators.peek() == '(') {
                        operators.pop();
                    }
                } else if (isOperator(firstChar)) {
                    while (!operators.isEmpty() && precedence(operators.peek()) >= precedence(firstChar)) {
                        values.push(applyOp(operators.pop(), values.pop(), values.pop()));
                    }
                    operators.push(firstChar);
                }
            }

            while (!operators.isEmpty()) {
                values.push(applyOp(operators.pop(), values.pop(), values.pop()));
            }

            return values.isEmpty() ? BigDecimal.ZERO : values.pop().setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            throw new PayrollCalculationException("Error evaluating formula: " + formula + " (" + e.getMessage() + ")", e);
        }
    }

    private boolean isOperator(char c) {
        return c == '+' || c == '-' || c == '*' || c == '/';
    }

    private int precedence(char op) {
        if (op == '+' || op == '-') return 1;
        if (op == '*' || op == '/') return 2;
        return 0;
    }

    private BigDecimal applyOp(char op, BigDecimal b, BigDecimal a) {
        return switch (op) {
            case '+' -> a.add(b);
            case '-' -> a.subtract(b);
            case '*' -> a.multiply(b);
            case '/' -> {
                if (b.signum() == 0) {
                    log.warn("Divide-by-zero in formula evaluation — returning 0. Check salary rule configuration.");
                    yield BigDecimal.ZERO;
                }
                yield a.divide(b, 4, RoundingMode.HALF_UP);
            }
            default -> BigDecimal.ZERO;
        };
    }
}
