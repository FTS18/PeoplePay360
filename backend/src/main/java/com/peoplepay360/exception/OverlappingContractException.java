package com.peoplepay360.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.time.LocalDate;
import java.util.UUID;

@ResponseStatus(HttpStatus.CONFLICT)
public class OverlappingContractException extends BusinessRuleViolationException {

    public OverlappingContractException(UUID employeeId, LocalDate startDate, LocalDate endDate) {
        super(String.format(
            "An active running contract already exists for employee %s overlapping with period %s to %s",
            employeeId,
            startDate,
            endDate != null ? endDate : "indefinite"
        ));
    }
}
