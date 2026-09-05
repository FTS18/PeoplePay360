package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.exception.PayrollCalculationException;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class RuleSequenceOrchestrator {

    public List<SalaryRule> orderAndValidateRules(List<SalaryRule> rules) {
        if (rules == null || rules.isEmpty()) {
            throw new PayrollCalculationException("Salary structure contains no active salary rules");
        }

        List<SalaryRule> sorted = rules.stream()
                .filter(SalaryRule::isActive)
                .sorted(Comparator.comparingInt(SalaryRule::getSequence))
                .toList();

        int highestCategoryRank = 0;
        for (SalaryRule rule : sorted) {
            int rank = getCategoryRank(rule.getCategory());
            if (rank < highestCategoryRank) {
                throw new PayrollCalculationException(String.format(
                        "Salary rule sequence violation: '%s' of category %s cannot be executed after category rank %d",
                        rule.getName(), rule.getCategory(), highestCategoryRank
                ));
            }
            highestCategoryRank = Math.max(highestCategoryRank, rank);
        }

        return sorted;
    }

    private int getCategoryRank(SalaryRuleCategory category) {
        return switch (category) {
            case BASIC -> 1;
            case ALLOWANCE -> 2;
            case GROSS -> 3;
            case DEDUCTION -> 4;
            case NET -> 5;
        };
    }
}
