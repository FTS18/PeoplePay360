package com.peoplepay360.modules.timeoff.repositories;

import com.peoplepay360.modules.timeoff.entities.TimeOffType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeOffTypeRepository extends JpaRepository<TimeOffType, UUID> {

    List<TimeOffType> findByActiveTrue();

    Optional<TimeOffType> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByName(String name);
}
