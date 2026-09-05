package com.peoplepay360.modules.payroll.entities;

import com.peoplepay360.common.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salary_structures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructure extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "salaryStructure", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    @Builder.Default
    private List<SalaryRule> rules = new ArrayList<>();

    public void addRule(SalaryRule rule) {
        rules.add(rule);
        rule.setSalaryStructure(this);
    }

    public void removeRule(SalaryRule rule) {
        rules.remove(rule);
        rule.setSalaryStructure(null);
    }
}
