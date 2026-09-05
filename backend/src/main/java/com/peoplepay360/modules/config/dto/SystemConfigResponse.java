package com.peoplepay360.modules.config.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.peoplepay360.modules.config.entities.SystemConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfigResponse {

    private UUID id;
    private String configKey;
    private String configValue;
    private String category;
    private String dataType;
    private String description;

    @JsonProperty("isEditable")
    private boolean isEditable;

    private String updatedBy;
    private Instant updatedAt;

    @JsonProperty("isEditable")
    public boolean getIsEditable() {
        return isEditable;
    }

    public static SystemConfigResponse from(SystemConfig config) {
        return SystemConfigResponse.builder()
                .id(config.getId())
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .category(config.getCategory())
                .dataType(config.getDataType())
                .description(config.getDescription())
                .isEditable(config.isEditable())
                .updatedBy(config.getUpdatedBy())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
