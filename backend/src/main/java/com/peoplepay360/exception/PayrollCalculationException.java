package com.peoplepay360.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class PayrollCalculationException extends RuntimeException {

    public PayrollCalculationException(String message) {
        super(message);
    }

    public PayrollCalculationException(String message, Throwable cause) {
        super(message, cause);
    }
}
