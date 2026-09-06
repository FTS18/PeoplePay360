package com.peoplepay360.modules.config.services;

import com.peoplepay360.exception.ResourceNotFoundException;
import com.peoplepay360.modules.config.entities.SystemConfig;
import com.peoplepay360.modules.config.repositories.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigService {

    private final SystemConfigRepository repository;

    @Transactional(readOnly = true)
    public List<SystemConfig> getAllConfigs() {
        return repository.findAllByOrderByCategoryAscConfigKeyAsc();
    }

    @Transactional(readOnly = true)
    public List<SystemConfig> getConfigsByCategory(String category) {
        return repository.findByCategoryOrderByConfigKeyAsc(category.toUpperCase());
    }

    @Transactional(readOnly = true)
    public Optional<SystemConfig> getConfigByKey(String key) {
        return repository.findByConfigKey(key);
    }

    @Transactional(readOnly = true)
    public String getString(String key, String defaultValue) {
        return repository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Transactional(readOnly = true)
    public double getDouble(String key, double defaultValue) {
        return repository.findByConfigKey(key)
                .map(c -> {
                    try {
                        return Double.parseDouble(c.getConfigValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    @Transactional(readOnly = true)
    public boolean getBoolean(String key, boolean defaultValue) {
        return repository.findByConfigKey(key)
                .map(c -> Boolean.parseBoolean(c.getConfigValue()))
                .orElse(defaultValue);
    }

    @Transactional
    public List<SystemConfig> bulkUpdate(Map<String, String> configs, String updatedBy) {
        log.info("Bulk updating {} system configuration parameters by user '{}'", configs.size(), updatedBy);
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();

            Optional<SystemConfig> existing = repository.findByConfigKey(key);
            if (existing.isPresent()) {
                SystemConfig cfg = existing.get();
                if (cfg.isEditable()) {
                    validateConfigValue(cfg.getConfigKey(), cfg.getDataType(), value);
                    cfg.setConfigValue(value.trim());
                    cfg.setUpdatedBy(updatedBy);
                    repository.save(cfg);
                }
            } else {
                // Infer category from key prefix (e.g. company.name -> COMPANY)
                String category = "SYSTEM";
                if (key.contains(".")) {
                    category = key.split("\\.")[0].toUpperCase();
                }

                validateConfigValue(key, "STRING", value);
                SystemConfig newCfg = SystemConfig.builder()
                        .configKey(key)
                        .configValue(value.trim())
                        .category(category)
                        .dataType("STRING")
                        .isEditable(true)
                        .updatedBy(updatedBy)
                        .build();
                repository.save(newCfg);
            }
        }
        return repository.findAllByOrderByCategoryAscConfigKeyAsc();
    }

    private void validateConfigValue(String key, String dataType, String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Configuration value for '" + key + "' cannot be blank.");
        }
        String trimmed = value.trim();
        if ("NUMBER".equalsIgnoreCase(dataType)) {
            double numVal;
            try {
                numVal = Double.parseDouble(trimmed);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Parameter '" + key + "' requires a valid number (provided: '" + value + "').");
            }
            if (numVal < 0) {
                throw new IllegalArgumentException("Parameter '" + key + "' cannot be negative (provided: " + value + ").");
            }
            if (key.toLowerCase().contains("percentage") || key.toLowerCase().contains("rate_per_hour")) {
                if (numVal > 100.0) {
                    throw new IllegalArgumentException("Percentage parameter '" + key + "' cannot exceed 100% (provided: " + value + ").");
                }
            }
            if (key.toLowerCase().contains("multiplier") && numVal > 10.0) {
                throw new IllegalArgumentException("Multiplier parameter '" + key + "' cannot exceed 10.0 (provided: " + value + ").");
            }
        } else if ("BOOLEAN".equalsIgnoreCase(dataType)) {
            if (!"true".equalsIgnoreCase(trimmed) && !"false".equalsIgnoreCase(trimmed)) {
                throw new IllegalArgumentException("Parameter '" + key + "' must be true or false.");
            }
        }
    }

    @Transactional
    public SystemConfig updateSingleConfig(String key, String value, String updatedBy) {
        SystemConfig cfg = repository.findByConfigKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemConfig", "configKey", key));

        if (!cfg.isEditable()) {
            throw new IllegalArgumentException("System configuration key '" + key + "' is protected and read-only");
        }

        validateConfigValue(cfg.getConfigKey(), cfg.getDataType(), value);
        cfg.setConfigValue(value.trim());
        cfg.setUpdatedBy(updatedBy);
        return repository.save(cfg);
    }
}
