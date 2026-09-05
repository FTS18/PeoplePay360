package com.peoplepay360.modules.config.repositories;

import com.peoplepay360.modules.config.entities.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID> {

    Optional<SystemConfig> findByConfigKey(String configKey);

    List<SystemConfig> findByCategoryOrderByConfigKeyAsc(String category);

    List<SystemConfig> findAllByOrderByCategoryAscConfigKeyAsc();
}
