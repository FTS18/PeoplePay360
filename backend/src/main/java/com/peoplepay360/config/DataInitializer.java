package com.peoplepay360.config;

import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final UserAndOrgSeeder userAndOrgSeeder;
    private final PayrollAndContractSeeder payrollAndContractSeeder;

    @Override
    public void run(String... args) {
        if (employeeRepository.count() == 0) {
            log.info("Fresh database detected. Initializing representative dataset for PeoplePay360...");
            userAndOrgSeeder.seedUsersAndOrg();
            payrollAndContractSeeder.seedPayrollAndContracts();
            log.info("PeoplePay360 dataset initialized successfully across all modules.");
        } else {
            log.info("Database already contains records. Skipping seed data generation.");
        }
    }
}
