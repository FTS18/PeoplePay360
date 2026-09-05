package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.PayslipStatus;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.Payslip;
import com.peoplepay360.modules.payroll.entities.PayslipLine;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SalaryCalculationEngine {

    private final RuleSequenceOrchestrator orchestrator;
    private final FormulaEvaluator formulaEvaluator;

    public Payslip computePayslip(
            Payrun payrun,
            Employee employee,
            Contract contract,
            SalaryStructure structure,
            int workedDays
    ) {
        List<SalaryRule> orderedRules = orchestrator.orderAndValidateRules(structure.getRules());

        Payslip payslip = Payslip.builder()
                .payrun(payrun)
                .employee(employee)
                .contract(contract)
                .salaryStructure(structure)
                .periodStart(payrun.getPeriodStart())
                .periodEnd(payrun.getPeriodEnd())
                .workedDays(workedDays)
                .basicWage(contract.getWage())
                .status(PayslipStatus.COMPUTED)
                .build();

        Map<String, BigDecimal> context = new HashMap<>();
        context.put("WAGE", contract.getWage());
        context.put("WORKED_DAYS", BigDecimal.valueOf(workedDays));

        BigDecimal totalBasic = BigDecimal.ZERO;
        BigDecimal totalAllowances = BigDecimal.ZERO;
        BigDecimal grossSalary = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        for (SalaryRule rule : orderedRules) {
            BigDecimal lineAmount = calculateRuleAmount(rule, context);
            context.put(rule.getCode().toUpperCase(), lineAmount);

            PayslipLine line = PayslipLine.builder()
                    .payslip(payslip)
                    .ruleCode(rule.getCode())
                    .ruleName(rule.getName())
                    .category(rule.getCategory())
                    .sequence(rule.getSequence())
                    .rate(rule.getPercentage())
                    .amount(lineAmount)
                    .build();

            payslip.addLine(line);

            switch (rule.getCategory()) {
                case BASIC -> {
                    totalBasic = totalBasic.add(lineAmount);
                    grossSalary = grossSalary.add(lineAmount);
                    context.put("BASIC", totalBasic);
                    context.put("GROSS", grossSalary);
                }
                case ALLOWANCE -> {
                    totalAllowances = totalAllowances.add(lineAmount);
                    grossSalary = grossSalary.add(lineAmount);
                    context.put("GROSS", grossSalary);
                }
                case GROSS -> {
                    grossSalary = lineAmount;
                    context.put("GROSS", grossSalary);
                }
                case DEDUCTION -> {
                    totalDeductions = totalDeductions.add(lineAmount);
                    context.put("DEDUCTIONS", totalDeductions);
                }
                case NET -> {
                    context.put("NET", lineAmount);
                }
            }
        }

        BigDecimal netSalary = grossSalary.subtract(totalDeductions).max(BigDecimal.ZERO);
        payslip.setGrossSalary(grossSalary.setScale(2, RoundingMode.HALF_UP));
        payslip.setTotalAllowances(totalAllowances.setScale(2, RoundingMode.HALF_UP));
        payslip.setTotalDeductions(totalDeductions.setScale(2, RoundingMode.HALF_UP));
        payslip.setNetSalary(netSalary.setScale(2, RoundingMode.HALF_UP));

        return payslip;
    }

    private BigDecimal calculateRuleAmount(SalaryRule rule, Map<String, BigDecimal> context) {
        if (rule.getComputationType() == ComputationType.FIXED) {
            return rule.getFixedAmount() != null ? rule.getFixedAmount() : BigDecimal.ZERO;
        }

        if (rule.getComputationType() == ComputationType.PERCENTAGE) {
            String baseCode = rule.getPercentageBaseCode() != null
                    ? rule.getPercentageBaseCode().toUpperCase()
                    : "BASIC";
            BigDecimal baseValue = context.getOrDefault(baseCode, BigDecimal.ZERO);
            BigDecimal pct = rule.getPercentage() != null ? rule.getPercentage() : BigDecimal.ZERO;
            return baseValue.multiply(pct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        if (rule.getComputationType() == ComputationType.FORMULA) {
            return formulaEvaluator.evaluate(rule.getFormula(), context);
        }

        return BigDecimal.ZERO;
    }
}
