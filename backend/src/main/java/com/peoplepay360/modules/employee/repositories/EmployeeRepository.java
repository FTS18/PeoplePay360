package com.peoplepay360.modules.employee.repositories;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.modules.employee.entities.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);

    Page<Employee> findByDepartmentAndStatus(String department, EmployeeStatus status, Pageable pageable);

    long countByStatus(EmployeeStatus status);

    long countByDepartment(String department);

    @Query("SELECT DISTINCT e.department FROM Employee e ORDER BY e.department ASC")
    List<String> findDistinctDepartments();

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Employee> searchEmployees(@Param("query") String query, Pageable pageable);

    Page<Employee> findByRole(com.peoplepay360.common.enums.Role role, Pageable pageable);

    long countByRole(com.peoplepay360.common.enums.Role role);

    @Query("SELECT e FROM Employee e WHERE e.role = :role AND (" +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Employee> searchByRoleAndQuery(
        @Param("role") com.peoplepay360.common.enums.Role role,
        @Param("query") String query,
        Pageable pageable
    );
}
