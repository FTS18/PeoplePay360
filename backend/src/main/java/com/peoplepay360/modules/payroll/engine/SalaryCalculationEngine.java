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
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.entities.WorkingScheduleLine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        return computePayslip(payrun, employee, contract, structure, workedDays, 0, 0);
    }

    public Payslip computePayslip(
            Payrun payrun,
            Employee employee,
            Contract contract,
            SalaryStructure structure,
            int workedDays,
            int unpaidLeaveDays,
            int paidLeaveDays
    ) {
        List<SalaryRule> orderedRules = orchestrator.orderAndValidateRules(structure.getRules());

        LocalDate pStart = payrun.getPeriodStart();
        LocalDate pEnd = payrun.getPeriodEnd();
        long periodDays = ChronoUnit.DAYS.between(pStart, pEnd) + 1;

        LocalDate sliceStart = contract.getStartDate().isAfter(pStart) ? contract.getStartDate() : pStart;
        LocalDate effectiveEnd = contract.getEndDate() != null ? contract.getEndDate() : pEnd;
        LocalDate sliceEnd = effectiveEnd.isBefore(pEnd) ? effectiveEnd : pEnd;

        long activeDays = Math.max(0, ChronoUnit.DAYS.between(sliceStart, sliceEnd) + 1);

        // Shift-Specific Time Slot Proration
        WorkingSchedule schedule = employee.getWorkingSchedule();
        BigDecimal totalPeriodShiftHours = calculateShiftHoursForPeriod(schedule, pStart, pEnd);
        BigDecimal activeSliceShiftHours = calculateShiftHoursForPeriod(schedule, sliceStart, sliceEnd);

        BigDecimal prorationRatio;
        if (totalPeriodShiftHours.compareTo(BigDecimal.ZERO) > 0) {
            prorationRatio = activeSliceShiftHours.divide(totalPeriodShiftHours, 6, RoundingMode.HALF_UP);
        } else if (periodDays > 0) {
            prorationRatio = BigDecimal.valueOf(activeDays).divide(BigDecimal.valueOf(periodDays), 6, RoundingMode.HALF_UP);
        } else {
            prorationRatio = BigDecimal.ONE;
        }

        BigDecimal proratedWage = contract.getWage().multiply(prorationRatio).setScale(2, RoundingMode.HALF_UP);

        Payslip payslip = Payslip.builder()
                .payrun(payrun)
                .employee(employee)
                .contract(contract)
                .salaryStructure(structure)
                .periodStart(pStart)
                .periodEnd(pEnd)
                .workedDays(workedDays)
                .basicWage(proratedWage)
                .status(PayslipStatus.COMPUTED)
                .build();

        Map<String, BigDecimal> context = new HashMap<>();
        context.put("WAGE", contract.getWage());
        context.put("PRORATED_WAGE", proratedWage);
        context.put("BASIC", proratedWage);
        context.put("PRORATION_RATIO", prorationRatio);
        context.put("TOTAL_PERIOD_SHIFT_HOURS", totalPeriodShiftHours);
        context.put("ACTIVE_SLICE_SHIFT_HOURS", activeSliceShiftHours);
        context.put("WORKED_DAYS", BigDecimal.valueOf(workedDays));
        context.put("ACTIVE_DAYS", BigDecimal.valueOf(activeDays));
        context.put("PERIOD_DAYS", BigDecimal.valueOf(periodDays));
        context.put("UNPAID_DAYS", BigDecimal.valueOf(unpaidLeaveDays));
        context.put("UNPAID_LEAVE_DAYS", BigDecimal.valueOf(unpaidLeaveDays));
        context.put("PAID_DAYS", BigDecimal.valueOf(paidLeaveDays));
        context.put("PAID_LEAVE_DAYS", BigDecimal.valueOf(paidLeaveDays));
        context.put("OVERTIME_HOURS", BigDecimal.ZERO);

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

    private BigDecimal calculateShiftHoursForPeriod(WorkingSchedule schedule, LocalDate start, LocalDate end) {
        if (start == null || end == null || start.isAfter(end)) {
            return BigDecimal.ZERO;
        }
        if (schedule == null || schedule.getLines() == null || schedule.getLines().isEmpty()) {
            long days = ChronoUnit.DAYS.between(start, end) + 1;
            return BigDecimal.valueOf(days * 8);
        }

        Map<DayOfWeek, BigDecimal> hoursMap = schedule.getLines().stream()
                .filter(l -> l.getDayOfWeek() != null && l.getWorkHours() != null)
                .collect(Collectors.toMap(
                        WorkingScheduleLine::getDayOfWeek,
                        WorkingScheduleLine::getWorkHours,
                        (existing, replacement) -> replacement
                ));

        BigDecimal totalHours = BigDecimal.ZERO;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            BigDecimal hoursForDay = hoursMap.getOrDefault(current.getDayOfWeek(), BigDecimal.ZERO);
            totalHours = totalHours.add(hoursForDay);
            current = current.plusDays(1);
        }
        return totalHours;
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

