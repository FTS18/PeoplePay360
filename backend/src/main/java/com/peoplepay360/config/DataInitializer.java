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
        if (employeeRepository.count() < 10) {
            log.info("Fresh database detected. Seeding full enterprise dataset (~260 employees)...");
            enterpriseDataSeeder.seedCompleteEnterprise();
            log.info("Enterprise dataset initialized.");
        } else {
            log.info("Database already populated ({} employees). Skipping seed.", employeeRepository.count());
        }
    }
}
