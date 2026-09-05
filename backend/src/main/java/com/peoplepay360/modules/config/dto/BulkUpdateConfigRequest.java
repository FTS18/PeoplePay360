package com.peoplepay360.modules.config.dto;

import jakarta.validation.constraints.NotEmpty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkUpdateConfigRequest {

    @NotEmpty(message = "Configuration settings map cannot be empty")
    private Map<String, String> configs;
}
