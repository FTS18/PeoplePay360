package com.peoplepay360.config;

import com.peoplepay360.common.enums.AttendanceStatus;
import com.peoplepay360.common.enums.ComputationType;
import com.peoplepay360.common.enums.ContractStatus;
import com.peoplepay360.common.enums.PayrunStatus;
import com.peoplepay360.common.enums.SalaryRuleCategory;
import com.peoplepay360.common.enums.TimeOffStatus;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.payroll.entities.Payrun;
import com.peoplepay360.modules.payroll.entities.SalaryRule;
import com.peoplepay360.modules.payroll.entities.SalaryStructure;
import com.peoplepay360.modules.payroll.repositories.PayrunRepository;
import com.peoplepay360.modules.payroll.repositories.SalaryStructureRepository;
import com.peoplepay360.modules.schedule.entities.WorkingSchedule;
import com.peoplepay360.modules.schedule.repositories.WorkingScheduleRepository;
import com.peoplepay360.modules.timeoff.entities.TimeOffAllocation;
import com.peoplepay360.modules.timeoff.entities.TimeOffType;
import com.peoplepay360.modules.timeoff.repositories.TimeOffAllocationRepository;
import com.peoplepay360.modules.timeoff.repositories.TimeOffTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayrollAndContractSeeder {

    private final SalaryStructureRepository structureRepository;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final WorkingScheduleRepository scheduleRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final TimeOffTypeRepository timeOffTypeRepository;
    private final TimeOffAllocationRepository allocationRepository;
    private final PayrunRepository payrunRepository;

    public void seedPayrollAndContracts() {
        log.info("Seeding salary structures, contracts, allocations, attendance and sample payrun...");

        SalaryStructure structure = SalaryStructure.builder()
                .name("Standard Corporate Structure")
                .code("STD-CORP")
                .description("Default structured salary computation for full-time corporate staff")
                .rules(new ArrayList<>())
                .build();

        addRule(structure, "Basic Wage", "BASIC", SalaryRuleCategory.BASIC, 10, ComputationType.FIXED, null, null, null, null);
        addRule(structure, "House Rent Allowance", "HRA", SalaryRuleCategory.ALLOWANCE, 20, ComputationType.PERCENTAGE, BigDecimal.valueOf(40), "BASIC", null, null);
        addRule(structure, "Transport Allowance", "TRANSPORT", SalaryRuleCategory.ALLOWANCE, 30, ComputationType.FIXED, null, null, BigDecimal.valueOf(3000), null);
        addRule(structure, "Gross Salary", "GROSS", SalaryRuleCategory.GROSS, 40, ComputationType.FORMULA, null, null, null, "BASIC + HRA + TRANSPORT");
        addRule(structure, "Provident Fund", "PF", SalaryRuleCategory.DEDUCTION, 50, ComputationType.PERCENTAGE, BigDecimal.valueOf(12), "BASIC", null, null);
        addRule(structure, "Income Tax", "TAX", SalaryRuleCategory.DEDUCTION, 60, ComputationType.PERCENTAGE, BigDecimal.valueOf(10), "GROSS", null, null);
        addRule(structure, "Net Salary", "NET", SalaryRuleCategory.NET, 70, ComputationType.FORMULA, null, null, null, "GROSS - PF - TAX");

        SalaryStructure savedStructure = structureRepository.save(structure);
        WorkingSchedule schedule = scheduleRepository.findAll().get(0);

        List<Employee> staff = employeeRepository.findAll().stream()
                .filter(e -> e.getEmail().contains("john.doe") || e.getEmail().contains("jane.smith"))
                .toList();

        TimeOffType ptoType = timeOffTypeRepository.findByActiveTrue().stream()
                .filter(t -> t.getCode().equals("PTO"))
                .findFirst()
                .orElse(null);

        LocalDate monthStart = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate monthEnd = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());

        for (Employee emp : staff) {
            BigDecimal wage = emp.getEmail().contains("john") ? BigDecimal.valueOf(65000) : BigDecimal.valueOf(75000);

            Contract contract = Contract.builder()
                    .reference("CTR-" + emp.getEmployeeCode() + "-2026")
                    .employee(emp)
                    .department(emp.getDepartment())
                    .jobPosition(emp.getJobPosition())
                    .salaryStructure(savedStructure)
                    .workingSchedule(schedule)
                    .wage(wage)
                    .startDate(LocalDate.now().minusMonths(3))
                    .status(ContractStatus.RUNNING)
                    .build();
            contractRepository.save(contract);

            if (ptoType != null) {
                allocationRepository.save(TimeOffAllocation.builder()
                        .employee(emp)
                        .timeOffType(ptoType)
                        .allocatedUnits(BigDecimal.valueOf(20))
                        .validFrom(LocalDate.of(LocalDate.now().getYear(), 1, 1))
                        .validTo(LocalDate.of(LocalDate.now().getYear(), 12, 31))
                        .status(TimeOffStatus.APPROVED)
                        .approvalDate(Instant.now())
                        .build());
            }

            for (int d = 1; d <= Math.min(LocalDate.now().getDayOfMonth(), 10); d++) {
                LocalDate date = monthStart.plusDays(d - 1);
                if (date.getDayOfWeek().getValue() <= 5) {
                    attendanceRepository.save(AttendanceRecord.builder()
                            .employee(emp)
                            .date(date)
                            .checkIn(Instant.now().minusSeconds(36000))
                            .checkOut(Instant.now().minusSeconds(7200))
                            .workedHours(BigDecimal.valueOf(8.00))
                            .expectedHours(BigDecimal.valueOf(8.00))
                            .status(AttendanceStatus.PRESENT)
                            .build());
                }
            }
        }

        payrunRepository.save(Payrun.builder()
                .name("Payrun " + monthStart.getMonth().name() + " " + monthStart.getYear())
                .salaryStructure(savedStructure)
                .periodStart(monthStart)
                .periodEnd(monthEnd)
                .status(PayrunStatus.DRAFT)
                .build());
    }

    private void addRule(SalaryStructure st, String name, String code, SalaryRuleCategory cat, int seq, ComputationType type, BigDecimal pct, String base, BigDecimal fixed, String formula) {
        SalaryRule rule = SalaryRule.builder()
                .name(name).code(code).category(cat).sequence(seq)
                .computationType(type).percentage(pct).percentageBaseCode(base)
                .fixedAmount(fixed).formula(formula).build();
        st.addRule(rule);
    }
}
