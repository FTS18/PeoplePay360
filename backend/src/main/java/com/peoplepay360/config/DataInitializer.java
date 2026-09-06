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
    private final EnterpriseDataSeeder enterpriseDataSeeder;

    @Override
    public void run(String... args) {
        if (employeeRepository.count() < 250) {
            log.info("Populating full enterprise dataset (260 employees across 7 departments)...");
            enterpriseDataSeeder.seedCompleteEnterprise();
            log.info("Enterprise dataset initialized successfully.");
        } else {
            log.info("Database already populated ({} employees). Skipping seed.", employeeRepository.count());
        }
    }
}
