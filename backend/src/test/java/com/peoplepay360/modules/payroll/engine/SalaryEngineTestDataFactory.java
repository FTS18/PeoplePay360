package com.peoplepay360.modules.payroll.engine;

import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.common.enums.EmployeeStatus;
import com.peoplepay360.common.enums.Role;
import com.peoplepay360.common.enums.ScheduleType;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.payroll.entities.PayslipLine;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.entities.WorkingScheduleLine;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public final class SalaryEngineTestDataFactory {

    private SalaryEngineTestDataFactory() {}

    public static WorkingSchedule buildStandardMondayToFridaySchedule() {
        WorkingSchedule schedule = WorkingSchedule.builder()
                .name("Standard 40h Schedule")
                .type(ScheduleType.FULL_TIME)
                .averageHoursPerDay(BigDecimal.valueOf(8))
                .totalWeeklyHours(BigDecimal.valueOf(40))
                .active(true)
                .lines(new ArrayList<>())
                .build();

        for (DayOfWeek day : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
            schedule.addLine(WorkingScheduleLine.builder()
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .breakHours(BigDecimal.ONE)
                    .workHours(BigDecimal.valueOf(8))
                    .build());
        }
        return schedule;
    }

    public static Employee buildEmployee(String code, String first, String last, WorkingSchedule schedule) {
        return Employee.builder()
                .employeeCode(code)
                .firstName(first)
                .lastName(last)
                .email(first.toLowerCase() + "@oxp.com")
                .password("encoded")
                .department("Engineering")
                .jobPosition("Software Engineer")
                .role(Role.EMPLOYEE)
                .status(EmployeeStatus.ACTIVE)
                .workingSchedule(schedule)
                .build();
    }

    public static Contract buildContract(Employee emp, BigDecimal wage, LocalDate start, LocalDate end) {
        return Contract.builder()
                .reference("CTR-" + emp.getEmployeeCode())
                .employee(emp)
                .wage(wage)
                .startDate(start)
                .endDate(end)
                .department("Engineering")
                .jobPosition("Software Engineer")
                .status(ContractStatus.RUNNING)
                .build();
    }

    public static PayslipLine findLine(List<PayslipLine> lines, String code) {
        return lines.stream()
                .filter(l -> l.getRuleCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Payslip line not found for rule code: " + code));
    }
}
