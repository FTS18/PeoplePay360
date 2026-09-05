package com.peoplepay360.config;

import com.peoplepay360.modules.config.entities.SystemConfig;
import com.peoplepay360.modules.config.repositories.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class SystemConfigSeeder implements CommandLineRunner {

    private final SystemConfigRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            log.info("Seeding default system configurations into PostgreSQL database...");

            List<SystemConfig> defaults = List.of(
                // COMPANY
                SystemConfig.builder().configKey("company.name").configValue("PeoplePay360 Inc.").category("COMPANY").dataType("STRING").description("Legal enterprise organization name").isEditable(true).build(),
                SystemConfig.builder().configKey("company.email").configValue("hr@peoplepay360.com").category("COMPANY").dataType("STRING").description("Official corporate HR support email").isEditable(true).build(),
                SystemConfig.builder().configKey("company.currency").configValue("₹").category("COMPANY").dataType("STRING").description("Primary currency symbol used across payroll calculations").isEditable(true).build(),
                SystemConfig.builder().configKey("company.tax_id").configValue("PAN-AAACP3600K").category("COMPANY").dataType("STRING").description("Enterprise Tax Registration / PAN Number").isEditable(true).build(),
                SystemConfig.builder().configKey("company.country").configValue("India").category("COMPANY").dataType("STRING").description("Headquarters operating country jurisdiction").isEditable(true).build(),

                // PAYROLL
                SystemConfig.builder().configKey("payroll.payrun_cycle").configValue("MONTHLY").category("PAYROLL").dataType("STRING").description("Default salary payment frequency (MONTHLY, BI_WEEKLY, WEEKLY)").isEditable(true).build(),
                SystemConfig.builder().configKey("payroll.standard_working_days").configValue("22").category("PAYROLL").dataType("NUMBER").description("Standard working days per month for proration").isEditable(true).build(),
                SystemConfig.builder().configKey("payroll.standard_hours_per_day").configValue("8.0").category("PAYROLL").dataType("NUMBER").description("Standard working hours in a normal workday").isEditable(true).build(),
                SystemConfig.builder().configKey("payroll.pf_percentage").configValue("12.0").category("PAYROLL").dataType("NUMBER").description("Employee Provident Fund (PF) contribution percentage").isEditable(true).build(),
                SystemConfig.builder().configKey("payroll.esi_percentage").configValue("0.75").category("PAYROLL").dataType("NUMBER").description("Employee State Insurance (ESI) contribution percentage").isEditable(true).build(),
                SystemConfig.builder().configKey("payroll.overtime_rate_multiplier").configValue("1.5").category("PAYROLL").dataType("NUMBER").description("Overtime wage multiplier per extra hour worked").isEditable(true).build(),
                SystemConfig.builder().configKey("payroll.late_deduction_rate_per_hour").configValue("0.5").category("PAYROLL").dataType("NUMBER").description("Fraction of hourly wage deducted per 30 minutes unapproved delay").isEditable(true).build(),

                // ATTENDANCE
                SystemConfig.builder().configKey("attendance.grace_period_minutes").configValue("15").category("ATTENDANCE").dataType("NUMBER").description("Grace period allowance in minutes before shift arrival is marked late").isEditable(true).build(),
                SystemConfig.builder().configKey("attendance.overtime_threshold_minutes").configValue("30").category("ATTENDANCE").dataType("NUMBER").description("Minimum extra minutes beyond shift before overtime accrual begins").isEditable(true).build(),
                SystemConfig.builder().configKey("attendance.allow_manual_override").configValue("true").category("ATTENDANCE").dataType("BOOLEAN").description("Allow managers to manually override employee check-in/out timestamps").isEditable(true).build(),
                SystemConfig.builder().configKey("attendance.auto_checkout_time").configValue("23:59").category("ATTENDANCE").dataType("STRING").description("Default automatic check-out time for unclosed shifts").isEditable(true).build(),

                // TIMEOFF
                SystemConfig.builder().configKey("timeoff.max_carry_forward_days").configValue("5.0").category("TIMEOFF").dataType("NUMBER").description("Maximum annual unused leave carry-forward limit per employee").isEditable(true).build(),
                SystemConfig.builder().configKey("timeoff.max_negative_balance").configValue("0.0").category("TIMEOFF").dataType("NUMBER").description("Maximum allowable negative leave allocation balance").isEditable(true).build(),
                SystemConfig.builder().configKey("timeoff.probation_restriction_days").configValue("90").category("TIMEOFF").dataType("NUMBER").description("Probationary period length during which paid leave is restricted").isEditable(true).build(),
                SystemConfig.builder().configKey("timeoff.require_manager_approval").configValue("true").category("TIMEOFF").dataType("BOOLEAN").description("Mandate explicit manager approval before leave allocation debit").isEditable(true).build(),

                // SYSTEM
                SystemConfig.builder().configKey("system.email_notifications").configValue("true").category("SYSTEM").dataType("BOOLEAN").description("Global toggle for automated email dispatch on payrun and leave events").isEditable(true).build(),
                SystemConfig.builder().configKey("system.session_timeout_minutes").configValue("60").category("SYSTEM").dataType("NUMBER").description("Inactivity threshold in minutes before JWT session invalidation").isEditable(true).build(),
                SystemConfig.builder().configKey("system.audit_logging").configValue("true").category("SYSTEM").dataType("BOOLEAN").description("Record user action audit logs for administrative write operations").isEditable(true).build()
            );

            repository.saveAll(defaults);
            log.info("Successfully seeded {} default system configurations.", defaults.size());
        }
    }
}
