package com.peoplepay360.config;

import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import com.peoplepay360.common.enums.ScheduleType;
import com.peoplepay360.common.enums.TimeOffUnit;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.entities.WorkingScheduleLine;
import com.peoplepay360.modules.schedule.services.WorkingScheduleService;
import com.peoplepay360.modules.timeoff.entities.TimeOffType;
import com.peoplepay360.modules.timeoff.repositories.TimeOffTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserAndOrgSeeder {

    private final WorkingScheduleService scheduleService;
    private final EmployeeRepository employeeRepository;
    private final TimeOffTypeRepository timeOffTypeRepository;
    private final PasswordEncoder passwordEncoder;

    public void seedUsersAndOrg() {
        log.info("Seeding working schedules, baseline users across all 5 roles, and leave types...");

        WorkingSchedule stdSchedule = WorkingSchedule.builder()
                .name("Standard Full-Time (40h)")
                .type(ScheduleType.FULL_TIME)
                .lines(new ArrayList<>())
                .build();

        for (DayOfWeek day : new DayOfWeek[]{DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY}) {
            WorkingScheduleLine line = WorkingScheduleLine.builder()
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(18, 0))
                    .breakHours(BigDecimal.ONE)
                    .build();
            stdSchedule.addLine(line);
        }
        WorkingSchedule savedSchedule = scheduleService.saveSchedule(stdSchedule);

        createEmployee("EMP001", "System", "Admin", "admin@peoplepay360.com", "Admin@123", "Executive", "Platform Admin", Role.ADMIN, savedSchedule);
        createEmployee("EMP002", "Sarah", "Connor", "hrmanager@peoplepay360.com", "HrManager@123", "Human Resources", "HR Manager", Role.HR_MANAGER, savedSchedule);
        createEmployee("EMP003", "Michael", "Scott", "payrollmanager@peoplepay360.com", "PayrollManager@123", "Finance", "HR Payroll Manager", Role.HR_PAYROLL_MANAGER, savedSchedule);
        createEmployee("EMP004", "Dwight", "Schrute", "payrolluser@peoplepay360.com", "PayrollUser@123", "Finance", "Payroll Officer", Role.HR_PAYROLL_USER, savedSchedule);
        createEmployee("EMP005", "John", "Doe", "john.doe@peoplepay360.com", "Employee@123", "Engineering", "Senior Software Engineer", Role.EMPLOYEE, savedSchedule);
        createEmployee("EMP006", "Jane", "Smith", "jane.smith@peoplepay360.com", "Employee@123", "Product", "Product Manager", Role.EMPLOYEE, savedSchedule);

        timeOffTypeRepository.save(TimeOffType.builder()
                .name("Paid Time Off")
                .code("PTO")
                .unit(TimeOffUnit.DAYS)
                .requiresAllocation(true)
                .colorCode("#0284C7")
                .isPaid(true)
                .payrollAffecting(false)
                .build());

        timeOffTypeRepository.save(TimeOffType.builder()
                .name("Sick Leave")
                .code("SICK")
                .unit(TimeOffUnit.DAYS)
                .requiresAllocation(true)
                .colorCode("#DC2626")
                .isPaid(true)
                .payrollAffecting(false)
                .build());

        timeOffTypeRepository.save(TimeOffType.builder()
                .name("Unpaid Leave")
                .code("UNPAID")
                .unit(TimeOffUnit.DAYS)
                .requiresAllocation(false)
                .colorCode("#64748B")
                .isPaid(false)
                .payrollAffecting(true)
                .build());
    }

    private void createEmployee(
            String code, String firstName, String lastName, String email, String password,
            String dept, String position, Role role, WorkingSchedule schedule
    ) {
        Employee emp = Employee.builder()
                .employeeCode(code)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .department(dept)
                .jobPosition(position)
                .role(role)
                .status(EmployeeStatus.ACTIVE)
                .workingSchedule(schedule)
                .bankAccountNumber("ACC-" + code + "-9988")
                .bankName("First Enterprise Bank")
                .bankIdentifierCode("FEB00012")
                .identificationNumber("TAX-ID-" + code)
                .joiningDate(LocalDate.now().minusMonths(6))
                .build();
        employeeRepository.save(emp);
    }
}
