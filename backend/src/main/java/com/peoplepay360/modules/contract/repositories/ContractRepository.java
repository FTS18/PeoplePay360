package com.peoplepay360.modules.contract.repositories;

import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.modules.contract.entities.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {

    @EntityGraph(attributePaths = {"employee", "salaryStructure", "workingSchedule"})
    List<Contract> findByEmployeeIdOrderByStartDateDesc(UUID employeeId);

    @Override
    @EntityGraph(attributePaths = {"employee", "salaryStructure", "workingSchedule"})
    List<Contract> findAll();

    @Override
    @EntityGraph(attributePaths = {"employee", "salaryStructure", "workingSchedule"})
    Optional<Contract> findById(UUID id);

    @EntityGraph(attributePaths = {"employee", "salaryStructure", "workingSchedule"})
    Page<Contract> findByStatus(ContractStatus status, Pageable pageable);

    @Query("SELECT c FROM Contract c " +
           "JOIN FETCH c.salaryStructure ss " +
           "JOIN FETCH c.workingSchedule ws " +
           "WHERE c.employee.id = :employeeId " +
           "AND c.status = 'RUNNING' " +
           "AND c.startDate <= :date " +
           "AND (c.endDate IS NULL OR c.endDate >= :date)")
    Optional<Contract> findActiveContractOnDate(
            @Param("employeeId") UUID employeeId,
            @Param("date") LocalDate date
    );

    @Query("SELECT c FROM Contract c " +
           "JOIN FETCH c.employee e " +
           "JOIN FETCH c.salaryStructure ss " +
           "JOIN FETCH c.workingSchedule ws " +
           "WHERE c.status = 'RUNNING' " +
           "AND c.startDate <= :periodEnd " +
           "AND (c.endDate IS NULL OR c.endDate >= :periodStart)")
    List<Contract> findActiveContractsInPeriod(
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    @Query("SELECT COUNT(c) > 0 FROM Contract c " +
           "WHERE c.employee.id = :employeeId " +
           "AND c.status = 'RUNNING' " +
           "AND (:excludeId IS NULL OR c.id != :excludeId) " +
           "AND c.startDate <= :newEnd " +
           "AND (c.endDate IS NULL OR c.endDate >= :newStart)")
    boolean existsOverlappingRunningContract(
            @Param("employeeId") UUID employeeId,
            @Param("excludeId") UUID excludeId,
            @Param("newStart") LocalDate newStart,
            @Param("newEnd") LocalDate newEnd
    );

    boolean existsByReference(String reference);

    @Query("SELECT COUNT(c) > 0 FROM Contract c WHERE c.workingSchedule.id = :workingScheduleId")
    boolean existsByWorkingScheduleId(@Param("workingScheduleId") UUID workingScheduleId);

    long countByStatus(ContractStatus status);
}
