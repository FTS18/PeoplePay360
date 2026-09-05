package com.peoplepay360.modules.config.entities;

import com.peoplepay360.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "system_configs",
    indexes = {
        @Index(name = "idx_system_configs_category", columnList = "category"),
        @Index(name = "idx_system_configs_key", columnList = "config_key", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig extends BaseEntity {

    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String configKey;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "data_type", nullable = false, length = 20)
    @Builder.Default
    private String dataType = "STRING";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_editable", nullable = false)
    @Builder.Default
    private boolean isEditable = true;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}
