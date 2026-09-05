package com.peoplepay360.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.math.BigDecimal;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientLeaveBalanceException extends BusinessRuleViolationException {

    public InsufficientLeaveBalanceException(String leaveTypeName, BigDecimal available, BigDecimal requested) {
        super(String.format(
            "Insufficient leave balance for %s. Available: %s, Requested: %s",
            leaveTypeName,
            available,
            requested
        ));
    }
}
