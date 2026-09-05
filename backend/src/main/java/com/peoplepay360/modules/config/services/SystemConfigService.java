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
                    cfg.setConfigValue(value);
                    cfg.setUpdatedBy(updatedBy);
                    repository.save(cfg);
                }
            } else {
                // Infer category from key prefix (e.g. company.name -> COMPANY)
                String category = "SYSTEM";
                if (key.contains(".")) {
                    category = key.split("\\.")[0].toUpperCase();
                }

                SystemConfig newCfg = SystemConfig.builder()
                        .configKey(key)
                        .configValue(value)
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

    @Transactional
    public SystemConfig updateSingleConfig(String key, String value, String updatedBy) {
        SystemConfig cfg = repository.findByConfigKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemConfig", "configKey", key));

        if (!cfg.isEditable()) {
            throw new IllegalArgumentException("System configuration key '" + key + "' is protected and read-only");
        }

        cfg.setConfigValue(value);
        cfg.setUpdatedBy(updatedBy);
        return repository.save(cfg);
    }
}
