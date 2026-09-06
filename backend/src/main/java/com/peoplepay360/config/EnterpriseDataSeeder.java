package com.peoplepay360.config;

import com.peoplepay360.common.enums.*;
import com.peoplepay360.modules.attendance.entities.AttendanceRecord;
import com.peoplepay360.modules.attendance.repositories.AttendanceRecordRepository;
import com.peoplepay360.modules.contract.entities.Contract;
import com.peoplepay360.modules.contract.repositories.ContractRepository;
import com.peoplepay360.modules.employee.entities.Employee;
import com.peoplepay360.modules.employee.repositories.EmployeeRepository;
import com.peoplepay360.modules.payroll.entities.*;
import com.peoplepay360.modules.payroll.repositories.*;
import com.peoplepay360.modules.schedule.entities.*;
import com.peoplepay360.modules.schedule.services.WorkingScheduleService;
import com.peoplepay360.modules.timeoff.entities.*;
import com.peoplepay360.modules.timeoff.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

/**
 * Seeds a realistic 260-employee dataset across 7 departments.
 * Insertion order is strictly dependency-safe (no FK violations).
 * Run once on fresh DB; DataInitializer guards the entry point.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnterpriseDataSeeder {

    private final WorkingScheduleService scheduleService;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final TimeOffTypeRepository timeOffTypeRepository;
    private final TimeOffAllocationRepository allocationRepository;
    private final TimeOffRequestRepository requestRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final SalaryStructureRepository structureRepository;
    private final PayrunRepository payrunRepository;
    private final PayslipRepository payslipRepository;
    private final PayslipLineRepository payslipLineRepository;
    private final PasswordEncoder passwordEncoder;

    // Pre-computed BCrypt hashes — avoid 260 individual encode() calls at startup
    private String empPasswordHash;
    private String adminPasswordHash;
    private String hrPasswordHash;
    private String payrollMgrPasswordHash;
    private String payrollUserPasswordHash;

    // Fixed-seed RNG — reproducible but non-repetitive across 260 employees
    private final Random rng = new Random(9137L);

    // Shuffled queues consumed sequentially — no cyclic repeating
    private final List<String> firstNameQueue = new ArrayList<>();
    private final List<String> lastNameQueue  = new ArrayList<>();

    private static final String[] FIRST_NAMES_POOL = {
        "Aarav","Aditya","Akash","Amit","Amrit","Anand","Anil","Anish",
        "Anjan","Ankit","Ankur","Anshul","Arjun","Arnav","Ashok","Ashwin",
        "Atul","Ayaan","Bharat","Chirag","Deepak","Dev","Dhruv","Dinesh",
        "Ganesh","Gaurav","Girish","Harsh","Hemant","Hitesh","Jagdish",
        "Jatin","Karan","Kartik","Kaushik","Kiran","Krishan","Kunal",
        "Lokesh","Mahesh","Manoj","Milind","Mohit","Naresh","Nikhil",
        "Nitin","Om","Pankaj","Parth","Pawan","Prakash","Pranav",
        "Prashant","Praveen","Rahul","Raj","Rajesh","Rakesh","Ram",
        "Ramesh","Ravi","Rishabh","Ritesh","Rohan","Rohit","Sachin",
        "Sagar","Sanjay","Sanket","Saurabh","Shashank","Shivam","Shyam",
        "Siddharth","Sourabh","Sudhir","Sunil","Suresh","Tarun","Tushar",
        "Ujjwal","Varun","Vijay","Vikas","Vikram","Vinay","Vipin","Vishal",
        "Vivek","Yash","Yogesh",
        // Female names
        "Aarti","Aditi","Aishwarya","Alka","Amita","Ananya","Anjali",
        "Ankita","Anupama","Archana","Asha","Bhavna","Chandni","Deepa",
        "Disha","Divya","Garima","Geeta","Gunjan","Hema","Ishita","Jyoti",
        "Kajal","Kavita","Khushi","Komal","Kriti","Lakshmi",
        "Lata","Madhuri","Manisha","Maya","Meena","Meera","Megha","Nandini",
        "Neha","Nisha","Pallavi","Pooja","Poonam","Preeti","Priya","Radha",
        "Rashmi","Rekha","Ritu","Riya","Sarita","Sakshi","Shilpa","Shruti",
        "Simran","Sita","Sneha","Sonia","Sonali","Srishti","Sunita",
        "Sushma","Swati","Tanvi","Usha","Varsha","Vidya"
    };

    private static final String[] LAST_NAMES_POOL = {
        "Aggarwal","Agarwal","Ahuja","Awasthi","Babu","Bajaj","Banerjee",
        "Bhatia","Bhatt","Bhattacharya","Bose","Chauhan","Chatterjee",
        "Chopra","Choudhury","Das","Desai","Deshmukh","Dixit","Dubey",
        "Dutta","Gandhi","Garg","Ghosh","Goswami","Gowda","Gupta",
        "Iyer","Jain","Jha","Joshi","Kapoor","Kaur","Khan","Khanna",
        "Krishnan","Kulkarni","Kumar","Lal","Mahajan","Malhotra","Mehta",
        "Menon","Mishra","Mukherjee","Nair","Nanda","Narang","Narayanan",
        "Pandey","Patel","Pillai","Prajapati","Rao","Rastogi","Rawat",
        "Reddy","Roy","Sah","Saxena","Sehgal","Sen","Sengupta","Seth",
        "Sharma","Shukla","Singh","Sinha","Solanki","Srivastava","Tiwari",
        "Tripathi","Upadhyay","Varma","Venkatesh","Verma","Yadav"
    };

    // [bankName, ifscPrefix] — 10 banks for realistic variety
    private static final String[][] BANK_DETAILS = {
        {"HDFC Bank",           "HDFC0"},
        {"ICICI Bank",          "ICIC0"},
        {"State Bank of India", "SBIN0"},
        {"Axis Bank",           "UTIB0"},
        {"Kotak Mahindra Bank", "KKBK0"},
        {"Punjab National Bank","PUNB0"},
        {"Bank of Baroda",      "BARB0"},
        {"Canara Bank",         "CNRB0"},
        {"IndusInd Bank",       "INDB0"},
        {"Yes Bank",            "YESB0"},
    };

    @Transactional
    public void seedCompleteEnterprise() {
        log.info("Enterprise seeding started...");

        this.empPasswordHash       = passwordEncoder.encode("Employee@123");
        this.adminPasswordHash     = passwordEncoder.encode("Admin@123");
        this.hrPasswordHash        = passwordEncoder.encode("HrManager@123");
        this.payrollMgrPasswordHash = passwordEncoder.encode("PayrollManager@123");
        this.payrollUserPasswordHash = passwordEncoder.encode("PayrollUser@123");

        // Build shuffled name queues large enough for 260 employees.
        // We repeat the pool twice then shuffle, giving 300+ unique-feeling combos.
        for (String n : FIRST_NAMES_POOL) firstNameQueue.add(n);
        for (String n : FIRST_NAMES_POOL) firstNameQueue.add(n);
        Collections.shuffle(firstNameQueue, rng);
        for (String n : LAST_NAMES_POOL) lastNameQueue.add(n);
        for (String n : LAST_NAMES_POOL) lastNameQueue.add(n);
        Collections.shuffle(lastNameQueue, rng);


        // ── Level 0: Master reference data ──────────────────────────────────
        WorkingSchedule std40h   = buildSchedule("Standard Full-Time (40h)",  ScheduleType.FULL_TIME,  9, 18, 1, true,  true,  true,  true,  true);
        WorkingSchedule shift    = buildSchedule("Support Shift (40h Rotational)", ScheduleType.SHIFT,  8, 17, 1, true,  true,  true,  true,  true);
        WorkingSchedule partTime = buildSchedule("Part-Time Contractor (20h)", ScheduleType.PART_TIME, 9, 14, 0, true,  true,  true,  true,  false);

        SalaryStructure stdStructure  = buildSalaryStructure("Standard Corporate",     "STD-CORP",     false);
        SalaryStructure execStructure = buildSalaryStructure("Executive Compensation", "EXEC-COMP",    true);

        Map<String, TimeOffType> leaveTypes = seedTimeOffTypes();

        // ── Level 1: Employees (Tier 0 → Tier 3, no forward FK refs) ────────
        List<Employee> allEmployees = seedEmployees(std40h, shift);

        // ── Level 2: Contracts & Allocations ────────────────────────────────
        seedContracts(allEmployees, stdStructure, execStructure, std40h, shift);
        seedLeaveAllocations(allEmployees, leaveTypes);

        // ── Level 3: Operational activity ───────────────────────────────────
        seedAttendance(allEmployees);
        seedLeaveRequests(allEmployees, leaveTypes);

        // ── Level 4: Payroll ledger ──────────────────────────────────────────
        seedPayruns(allEmployees, stdStructure, execStructure);

        log.info("Enterprise seeding complete. {} employees seeded.", allEmployees.size());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SCHEDULES
    // ─────────────────────────────────────────────────────────────────────────

    private WorkingSchedule buildSchedule(
            String name, ScheduleType type,
            int startHour, int endHour, int breakHrs,
            boolean mon, boolean tue, boolean wed, boolean thu, boolean fri
    ) {
        WorkingSchedule sched = WorkingSchedule.builder()
                .name(name)
                .type(type)
                // totalWeeklyHours and averageHoursPerDay are computed by recalculateHours()
                .totalWeeklyHours(BigDecimal.ZERO)
                .averageHoursPerDay(BigDecimal.ZERO)
                .lines(new ArrayList<>())
                .build();

        boolean[] flags = {mon, tue, wed, thu, fri};
        DayOfWeek[] days = {DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY};
        for (int i = 0; i < 5; i++) {
            if (!flags[i]) continue;
            WorkingScheduleLine line = WorkingScheduleLine.builder()
                    .dayOfWeek(days[i])
                    .startTime(LocalTime.of(startHour, 0))
                    .endTime(LocalTime.of(endHour, 0))
                    .breakHours(BigDecimal.valueOf(breakHrs))
                    // workHours is computed by recalculateHours()
                    .workHours(BigDecimal.ZERO)
                    .build();
            sched.addLine(line);
        }
        // saveSchedule() calls recalculateHours() before persisting
        return scheduleService.saveSchedule(sched);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SALARY STRUCTURES
    // ─────────────────────────────────────────────────────────────────────────

    private SalaryStructure buildSalaryStructure(String name, String code, boolean isExec) {
        SalaryStructure st = SalaryStructure.builder()
                .name(name)
                .code(code)
                .description(isExec ? "Compensation model for C-suite and VP-level roles" : "Default structured compensation for full-time staff")
                .rules(new ArrayList<>())
                .build();

        // Each rule: BASIC is always FIXED at contract.wage; others are relative
        st.addRule(rule("Basic Wage",            "BASIC",     SalaryRuleCategory.BASIC,     10, ComputationType.FIXED,      null, null, null, null));
        st.addRule(rule("House Rent Allowance",  "HRA",       SalaryRuleCategory.ALLOWANCE, 20, ComputationType.PERCENTAGE, isExec ? BD(40) : BD(40), "BASIC", null, null));
        st.addRule(rule("Transport Allowance",   "TRANSPORT", SalaryRuleCategory.ALLOWANCE, 30, ComputationType.FIXED,      null, null, isExec ? BD(5000) : BD(3000), null));
        if (isExec) {
            st.addRule(rule("Special Allowance", "SPECIAL",   SalaryRuleCategory.ALLOWANCE, 35, ComputationType.PERCENTAGE, BD(15), "BASIC", null, null));
        }
        st.addRule(rule("Gross Salary",          "GROSS",     SalaryRuleCategory.GROSS,     40, ComputationType.FORMULA,    null, null, null, isExec ? "BASIC + HRA + TRANSPORT + SPECIAL" : "BASIC + HRA + TRANSPORT"));
        st.addRule(rule("Provident Fund",        "PF",        SalaryRuleCategory.DEDUCTION, 50, ComputationType.PERCENTAGE, BD(12), "BASIC", null, null));
        st.addRule(rule("Income Tax",            "TAX",       SalaryRuleCategory.DEDUCTION, 60, ComputationType.PERCENTAGE, isExec ? BD(20) : BD(10), "GROSS", null, null));
        st.addRule(rule("Net Salary",            "NET",       SalaryRuleCategory.NET,       70, ComputationType.FORMULA,    null, null, null, "GROSS - PF - TAX"));

        return structureRepository.save(st);
    }

    private SalaryRule rule(String name, String code, SalaryRuleCategory cat, int seq, ComputationType type,
                            BigDecimal pct, String base, BigDecimal fixed, String formula) {
        return SalaryRule.builder()
                .name(name).code(code).category(cat).sequence(seq)
                .computationType(type).percentage(pct).percentageBaseCode(base)
                .fixedAmount(fixed).formula(formula)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TIME-OFF TYPES
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, TimeOffType> seedTimeOffTypes() {
        Map<String, TimeOffType> map = new LinkedHashMap<>();
        save(map, "PTO",    "Paid Time Off",        "#0284C7", true,  false);
        save(map, "SICK",   "Sick Leave",           "#DC2626", true,  false);
        save(map, "CASUAL", "Casual Leave",         "#16A34A", true,  false);
        save(map, "UNPAID", "Unpaid Leave",         "#64748B", false, true);
        save(map, "MAT",    "Maternity / Paternity","#9333EA", true,  false);
        return map;
    }

    private void save(Map<String, TimeOffType> map, String code, String name, String color, boolean isPaid, boolean payrollAffecting) {
        map.put(code, timeOffTypeRepository.save(
            TimeOffType.builder()
                .code(code).name(name).colorCode(color)
                .unit(TimeOffUnit.DAYS).requiresAllocation(true)
                .isPaid(isPaid).payrollAffecting(payrollAffecting)
                .build()
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EMPLOYEES — 4-tier tree, seeded tier-by-tier to avoid self-FK conflicts
    // ─────────────────────────────────────────────────────────────────────────

    private List<Employee> seedEmployees(WorkingSchedule std40h, WorkingSchedule shift) {
        List<Employee> all = new ArrayList<>(265);

        // ── Tier 0: CEO ──────────────────────────────────────────────────────
        Employee ceo = employeeRepository.save(emp(
            "EMP001", "Aarav", "Sharma", "admin@peoplepay360.com", adminPasswordHash,
            "Executive", "Chief Executive Officer", Role.ADMIN, null,
            std40h, LocalDate.of(2020, 3, 1), 0
        ));
        all.add(ceo);

        // ── Tier 1: Department Heads (6) ─────────────────────────────────────
        record HeadDef(String code, String fn, String ln, String email, String password, String dept, String title, Role role) {}
        List<HeadDef> headDefs = List.of(
            new HeadDef("EMP002", "Priya",     "Nair",    "cto@peoplepay360.com",            adminPasswordHash,      "Engineering",         "Chief Technology Officer",     Role.ADMIN),
            new HeadDef("EMP003", "Rajesh",    "Gupta",   "vp.eng@peoplepay360.com",          empPasswordHash,        "Engineering",         "VP Engineering",               Role.EMPLOYEE),
            new HeadDef("EMP004", "Meera",     "Iyer",    "vp.product@peoplepay360.com",      empPasswordHash,        "Product & Design",    "VP Product",                   Role.EMPLOYEE),
            new HeadDef("EMP005", "Vikram",    "Mehta",   "cco@peoplepay360.com",             empPasswordHash,        "Sales & Marketing",   "Chief Commercial Officer",     Role.EMPLOYEE),
            new HeadDef("EMP006", "Ananya",    "Kulkarni","vp.people@peoplepay360.com",       hrPasswordHash,         "Human Resources",     "VP People",                    Role.HR_MANAGER),
            new HeadDef("EMP007", "Siddharth", "Joshi",   "vp.finance@peoplepay360.com",      payrollMgrPasswordHash, "Finance",             "VP Finance",                   Role.HR_PAYROLL_MANAGER)
        );
        List<Employee> heads = new ArrayList<>();
        for (int i = 0; i < headDefs.size(); i++) {
            HeadDef h = headDefs.get(i);
            Employee head = employeeRepository.save(emp(
                h.code(), h.fn(), h.ln(), h.email(), h.password(),
                h.dept(), h.title(), h.role(), ceo, std40h,
                LocalDate.of(2021, 1, 10).plusMonths(i), i
            ));
            heads.add(head);
            all.add(head);
        }

        // ── Tier 2: Managers / Team Leads (18) ──────────────────────────────
        // Distribute: Eng gets 6 leads, Product 3, Sales 3, Support 2, HR 2, Finance 2
        record LeadDef(String dept, String title, Role role, Employee manager) {}
        Employee engVP   = heads.get(1); // EMP003
        Employee prodVP  = heads.get(2); // EMP004
        Employee salesVP = heads.get(3); // EMP005
        Employee hrVP    = heads.get(4); // EMP006
        Employee finVP   = heads.get(5); // EMP007

        List<LeadDef> leadDefs = new ArrayList<>();
        for (int i = 0; i < 6; i++) leadDefs.add(new LeadDef("Engineering", "Engineering Manager", Role.EMPLOYEE, engVP));
        for (int i = 0; i < 3; i++) leadDefs.add(new LeadDef("Product & Design", "Senior Product Manager", Role.EMPLOYEE, prodVP));
        for (int i = 0; i < 3; i++) leadDefs.add(new LeadDef("Sales & Marketing", "Sales Manager", Role.EMPLOYEE, salesVP));
        leadDefs.add(new LeadDef("Customer Support", "Support Lead", Role.EMPLOYEE, heads.get(0))); // under CTO
        leadDefs.add(new LeadDef("Customer Support", "IT Operations Lead", Role.EMPLOYEE, heads.get(0)));
        leadDefs.add(new LeadDef("Human Resources", "HR Manager", Role.HR_MANAGER, hrVP));
        leadDefs.add(new LeadDef("Human Resources", "Talent Acquisition Lead", Role.HR_MANAGER, hrVP));
        leadDefs.add(new LeadDef("Finance", "HR Payroll Manager", Role.HR_PAYROLL_MANAGER, finVP));
        leadDefs.add(new LeadDef("Finance", "Payroll Officer", Role.HR_PAYROLL_USER, finVP));

        List<Employee> leads = new ArrayList<>();
        for (int i = 0; i < leadDefs.size(); i++) {
            LeadDef l = leadDefs.get(i);
            int empNum = 8 + i;
            String code = String.format("EMP%03d", empNum);
            String fn = nextName(firstNameQueue);
            String ln = nextName(lastNameQueue);
            WorkingSchedule sched = l.dept().equals("Customer Support") ? shift : std40h;
            String email = "lead." + code.toLowerCase() + "@peoplepay360.com";
            String pass  = resolvePassword(l.role());

            Employee lead = employeeRepository.save(emp(
                code, fn, ln, email, pass, l.dept(), l.title(), l.role(), l.manager(),
                sched, LocalDate.of(2022, 6, 1).plusDays(i * 15L), empNum
            ));
            leads.add(lead);
            all.add(lead);
        }

        // ── Tier 3: Individual Contributors (235) ────────────────────────────
        List<Employee> ics = new ArrayList<>(235);
        for (int i = 0; i < 235; i++) {
            int empNum = 26 + i;
            String code = String.format("EMP%03d", empNum);
            Employee mgr = leads.get(i % leads.size());

            Role icRole = resolveIcRole(mgr.getDepartment(), i);
            WorkingSchedule sched = mgr.getDepartment().equals("Customer Support") ? shift : std40h;

            // Stagger joining dates realistically: Jan 2023 – Jun 2026
            LocalDate joiningDate = LocalDate.of(2023, 1, 5).plusDays((long) i * 4);

            boolean isInactive = i >= 230; // last 5 are INACTIVE (terminated employees)

            Employee ic = emp(
                code,
                nextName(firstNameQueue),
                nextName(lastNameQueue),
                "emp" + empNum + "@peoplepay360.com",
                empPasswordHash,
                mgr.getDepartment(),
                resolveJobTitle(mgr.getDepartment(), i),
                icRole,
                mgr,
                sched,
                joiningDate,
                empNum
            );
            if (isInactive) ic.setStatus(EmployeeStatus.INACTIVE);
            ics.add(ic);
        }
        all.addAll(employeeRepository.saveAll(ics));
        return all;
    }

    private Employee emp(String code, String fn, String ln, String email, String password,
                         String dept, String title, Role role, Employee manager,
                         WorkingSchedule schedule, LocalDate joiningDate, int seed) {
        int bankIdx = rng.nextInt(BANK_DETAILS.length);
        String[] bank = BANK_DETAILS[bankIdx];
        // Account: 12-digit numeric with per-employee randomness
        long acctNum = 100000000000L + seed * 97L + rng.nextInt(9999);
        // IFSC: prefix + 6-digit branch code
        String ifsc = bank[1] + String.format("%06d", 1000 + (seed * 37 + rng.nextInt(200)) % 9000);
        // PAN: ABCDE1234F format — first 5 alpha derived from name, 4 digit serial, 1 alpha check
        char[] panAlpha = {'A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'};
        String pan = String.format("%c%c%c%c%c%04d%c",
            Character.toUpperCase(fn.charAt(0)),
            panAlpha[rng.nextInt(panAlpha.length)],
            panAlpha[rng.nextInt(panAlpha.length)],
            panAlpha[rng.nextInt(panAlpha.length)],
            Character.toUpperCase(ln.charAt(0)),
            (seed * 31 + 1000) % 9000 + 1000,
            panAlpha[rng.nextInt(panAlpha.length)]
        );
        return Employee.builder()
                .employeeCode(code)
                .firstName(fn).lastName(ln)
                .email(email).password(password)
                .department(dept).jobPosition(title)
                .role(role)
                .status(EmployeeStatus.ACTIVE)
                .manager(manager)
                .workingSchedule(schedule)
                .bankAccountNumber(Long.toString(acctNum))
                .bankName(bank[0])
                .bankIdentifierCode(ifsc)
                .identificationNumber(pan)
                .joiningDate(joiningDate)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CONTRACTS
    // ─────────────────────────────────────────────────────────────────────────

    private void seedContracts(List<Employee> employees, SalaryStructure std, SalaryStructure exec,
                               WorkingSchedule std40h, WorkingSchedule shift) {
        List<Contract> contracts = new ArrayList<>(employees.size());
        LocalDate today = LocalDate.now();

        for (Employee emp : employees) {
            boolean isExec = emp.getRole() == Role.ADMIN ||
                             emp.getJobPosition().contains("VP") ||
                             emp.getJobPosition().contains("Chief");

            SalaryStructure structure = isExec ? exec : std;
            WorkingSchedule sched = emp.getWorkingSchedule();
            BigDecimal wage = resolveWage(emp.getJobPosition(), emp.getRole());

            ContractStatus status;
            if (emp.getStatus() == EmployeeStatus.INACTIVE) {
                status = ContractStatus.EXPIRED;
            } else {
                status = ContractStatus.RUNNING;
            }

            LocalDate startDate = emp.getJoiningDate();
            // Employees joining after today get DRAFT contracts (future hires)
            if (startDate.isAfter(today)) {
                status = ContractStatus.DRAFT;
            }

            contracts.add(Contract.builder()
                    .reference("CTR-" + emp.getEmployeeCode() + "-2026")
                    .employee(emp)
                    .department(emp.getDepartment())
                    .jobPosition(emp.getJobPosition())
                    .salaryStructure(structure)
                    .workingSchedule(sched)
                    .wage(wage)
                    .startDate(startDate)
                    .endDate(status == ContractStatus.EXPIRED ? startDate.plusYears(2) : null)
                    .status(status)
                    .build());
        }
        contractRepository.saveAll(contracts);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TIME-OFF ALLOCATIONS
    // ─────────────────────────────────────────────────────────────────────────

    private void seedLeaveAllocations(List<Employee> employees, Map<String, TimeOffType> types) {
        List<TimeOffAllocation> allocations = new ArrayList<>(employees.size() * 3);
        LocalDate yearStart = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate yearEnd   = LocalDate.of(LocalDate.now().getYear(), 12, 31);

        // Find an HR manager to be the approver for all allocations
        Employee approver = employees.stream()
                .filter(e -> e.getRole() == Role.HR_MANAGER)
                .findFirst()
                .orElse(employees.get(0));

        for (Employee emp : employees) {
            if (emp.getStatus() == EmployeeStatus.INACTIVE) continue;

            allocations.add(alloc(emp, types.get("PTO"),    BD(20), yearStart, yearEnd, approver));
            allocations.add(alloc(emp, types.get("SICK"),   BD(12), yearStart, yearEnd, approver));
            allocations.add(alloc(emp, types.get("CASUAL"), BD(6),  yearStart, yearEnd, approver));
        }
        allocationRepository.saveAll(allocations);
    }

    private TimeOffAllocation alloc(Employee emp, TimeOffType type, BigDecimal units,
                                    LocalDate from, LocalDate to, Employee approver) {
        return TimeOffAllocation.builder()
                .employee(emp)
                .timeOffType(type)
                .allocatedUnits(units)
                .validFrom(from)
                .validTo(to)
                // Correct field name: approver (not approvedBy)
                .approver(approver)
                .status(TimeOffStatus.APPROVED)
                .approvalDate(Instant.now().minusSeconds(86400L * 30))
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEAVE REQUESTS — varied statuses, varied months, realistic spread
    // ─────────────────────────────────────────────────────────────────────────

    private void seedLeaveRequests(List<Employee> employees, Map<String, TimeOffType> types) {
        List<TimeOffRequest> requests = new ArrayList<>(400);
        List<Employee> activeEmps = employees.stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .toList();

        Map<UUID, List<LocalDate[]>> approvedRanges = new HashMap<>();

        // Spread 400 requests across past 6 months
        for (int i = 0; i < 400; i++) {
            Employee emp = activeEmps.get(rng.nextInt(activeEmps.size()));
            Employee approver = emp.getManager() != null ? emp.getManager() : employees.get(0);

            int monthOffset = rng.nextInt(6); // 0–5 months ago
            int maxDay = LocalDate.now().minusMonths(monthOffset).lengthOfMonth();
            int dayOfMonth = 1 + rng.nextInt(Math.min(maxDay, 25));
            LocalDate start = LocalDate.now().minusMonths(monthOffset).withDayOfMonth(dayOfMonth);
            if (start.isAfter(LocalDate.now())) start = LocalDate.now().minusDays(1);
            int duration = 1 + rng.nextInt(4); // 1–4 days
            LocalDate end = start.plusDays(duration - 1);

            // Distribution: 50% PTO, 25% SICK, 18% CASUAL, 7% UNPAID
            int typeRoll = rng.nextInt(100);
            String typeCode;
            int reasonGroup;
            if      (typeRoll < 50) { typeCode = "PTO";    reasonGroup = 1; }
            else if (typeRoll < 75) { typeCode = "SICK";   reasonGroup = 0; }
            else if (typeRoll < 93) { typeCode = "CASUAL"; reasonGroup = 2; }
            else                    { typeCode = "UNPAID"; reasonGroup = 3; }

            String[] reasonPool = LEAVE_REASONS[reasonGroup];
            String reason = reasonPool[rng.nextInt(reasonPool.length)];

            // Distribution: 68% APPROVED, 22% CONFIRM (pending), 10% REFUSED
            int stRoll = rng.nextInt(100);
            TimeOffStatus status;
            if      (stRoll < 68) status = TimeOffStatus.APPROVED;
            else if (stRoll < 90) status = TimeOffStatus.CONFIRM;
            else                  status = TimeOffStatus.REFUSED;

            // Ensure exclusion constraint "exclude_approved_leave_overlap" is satisfied
            if (status == TimeOffStatus.APPROVED) {
                List<LocalDate[]> ranges = approvedRanges.computeIfAbsent(emp.getId(), k -> new ArrayList<>());
                boolean overlaps = false;
                for (LocalDate[] r : ranges) {
                    if (!start.isAfter(r[1]) && !end.isBefore(r[0])) {
                        overlaps = true;
                        break;
                    }
                }
                if (overlaps) {
                    status = TimeOffStatus.CONFIRM;
                } else {
                    ranges.add(new LocalDate[]{start, end});
                }
            }

            requests.add(TimeOffRequest.builder()
                    .employee(emp)
                    .timeOffType(types.get(typeCode))
                    .startDate(start)
                    .endDate(end)
                    .requestedUnits(BigDecimal.valueOf(duration))
                    .status(status)
                    .reason(reason)
                    .approver(status == TimeOffStatus.CONFIRM ? null : approver)
                    .approvalDate(status == TimeOffStatus.APPROVED ? Instant.now().minusSeconds(86400L * (rng.nextInt(25) + 2)) : null)
                    .rejectionReason(status == TimeOffStatus.REFUSED ? "Leave balance insufficient or team capacity constraints" : null)
                    .build());
        }
        requestRepository.saveAll(requests);
    }

    private static final String[][] LEAVE_REASONS = {
        // SICK
        {"Viral fever and doctor-advised rest", "Severe migraine, unable to work",
         "Flu symptoms and body ache", "Dental surgery recovery",
         "Child's illness requiring parental care", "Food poisoning"},
        // PTO
        {"Family function in native village", "Annual vacation to Goa",
         "Attending sibling's wedding", "Religious festival observance",
         "Personal work — property registration", "Holiday trip with family"},
        // CASUAL
        {"Personal errand at government office", "Vehicle breakdown",
         "House shifting", "Bank-related work",
         "Electricity board visit", "Municipal office work"},
        // UNPAID
        {"Extended family emergency", "Personal financial matter",
         "Medical procedure not covered under sick leave", "Bereavement leave extension"},
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ATTENDANCE — 14 working days per active employee, realistic variation
    // ─────────────────────────────────────────────────────────────────────────

    private void seedAttendance(List<Employee> employees) {
        List<AttendanceRecord> records = new ArrayList<>(260 * 14);
        LocalDate today = LocalDate.now();
        Random rng = new Random(42); // fixed seed for reproducible but varied data

        for (Employee emp : employees) {
            if (emp.getStatus() == EmployeeStatus.INACTIVE) continue;

            for (int daysAgo = 1; daysAgo <= 150; daysAgo++) {
                LocalDate date = today.minusDays(daysAgo);
                if (date.getDayOfWeek().getValue() > 5) continue; // skip weekends

                // Per-employee per-day variation using employee code hash + day
                int roll = Math.abs((emp.getEmployeeCode() + date).hashCode()) % 100;

                // 85% PRESENT, 8% LATE, 5% EXCEPTION, 2% ABSENT
                AttendanceStatus status;
                if (roll < 85)       status = AttendanceStatus.PRESENT;
                else if (roll < 93)  status = AttendanceStatus.LATE;
                else if (roll < 98)  status = AttendanceStatus.EXCEPTION;
                else                 status = AttendanceStatus.ABSENT;

                // Anchor timestamps to the actual attendance date, not Instant.now()
                LocalDateTime checkInDt  = date.atTime(status == AttendanceStatus.LATE ? 10 : 9, rng.nextInt(30));
                LocalDateTime checkOutDt = date.atTime(17 + rng.nextInt(2), 30 + rng.nextInt(30));

                BigDecimal worked = BigDecimal.valueOf(
                        Duration.between(checkInDt, checkOutDt).toMinutes() / 60.0
                ).subtract(BigDecimal.ONE) // subtract 1h break
                 .setScale(2, RoundingMode.HALF_UP)
                 .max(BigDecimal.ZERO);

                if (status == AttendanceStatus.ABSENT) {
                    // No check-in / check-out for absent
                    records.add(AttendanceRecord.builder()
                            .employee(emp).date(date)
                            .workedHours(BigDecimal.ZERO)
                            .expectedHours(BD(8))
                            .status(status)
                            .build());
                } else {
                    records.add(AttendanceRecord.builder()
                            .employee(emp).date(date)
                            .checkIn(checkInDt.toInstant(ZoneOffset.UTC))
                            .checkOut(checkOutDt.toInstant(ZoneOffset.UTC))
                            .workedHours(worked)
                            .expectedHours(BD(8))
                            .status(status)
                            .manualOverride(status == AttendanceStatus.EXCEPTION)
                            .overrideReason(status == AttendanceStatus.EXCEPTION ? "Biometric reader error on floor 3" : null)
                            .build());
                }
            }
        }
        attendanceRepository.saveAll(records);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAYRUNS: 2 historical PAID + 1 active DRAFT
    // ─────────────────────────────────────────────────────────────────────────

    private void seedPayruns(List<Employee> employees, SalaryStructure std, SalaryStructure exec) {
        // Fetch only RUNNING contracts that started on or before last month end
        LocalDate lastMonthEnd = LocalDate.now().minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
        List<Contract> activeContracts = contractRepository.findActiveContractsInPeriod(
                LocalDate.now().minusMonths(6).with(TemporalAdjusters.firstDayOfMonth()),
                lastMonthEnd
        );

        // Build a map for fast lookup: employeeId → contract
        Map<UUID, Contract> contractByEmpId = new HashMap<>(activeContracts.size());
        for (Contract c : activeContracts) {
            contractByEmpId.put(c.getEmployee().getId(), c);
        }

        // Seed month -6 to month -1 (PAID)
        for (int monthsBack = 6; monthsBack >= 1; monthsBack--) {
            LocalDate periodStart = LocalDate.now().minusMonths(monthsBack).with(TemporalAdjusters.firstDayOfMonth());
            LocalDate periodEnd   = LocalDate.now().minusMonths(monthsBack).with(TemporalAdjusters.lastDayOfMonth());

            Payrun payrun = Payrun.builder()
                    .name("Payrun " + periodStart.getMonth().name() + " " + periodStart.getYear())
                    .salaryStructure(std)
                    .periodStart(periodStart)
                    .periodEnd(periodEnd)
                    .status(PayrunStatus.PAID)
                    .paidAt(Instant.now().minusSeconds(86400L * (monthsBack * 30 - 15))) // roughly mid of following month
                    .build();
            payrun = payrunRepository.save(payrun);

            List<Payslip> payslips = new ArrayList<>(activeContracts.size());
            BigDecimal runBasic = BigDecimal.ZERO, runAllowances = BigDecimal.ZERO,
                       runDeductions = BigDecimal.ZERO, runNet = BigDecimal.ZERO;

            for (Contract c : activeContracts) {
                // Only include contracts active during this specific period
                if (!c.isActiveOn(periodStart) && !c.isActiveOn(periodEnd)) continue;

                boolean isExec = c.getSalaryStructure().getCode().equals("EXEC-COMP");
                BigDecimal basic     = c.getWage();
                BigDecimal hra       = basic.multiply(BD(40)).divide(BD(100), 2, RoundingMode.HALF_UP);
                BigDecimal transport = isExec ? BD(5000) : BD(3000);
                BigDecimal special   = isExec ? basic.multiply(BD(15)).divide(BD(100), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                BigDecimal gross     = basic.add(hra).add(transport).add(special);
                BigDecimal pf        = basic.multiply(BD(12)).divide(BD(100), 2, RoundingMode.HALF_UP);
                BigDecimal taxRate   = isExec ? BD(20) : BD(10);
                BigDecimal tax       = gross.multiply(taxRate).divide(BD(100), 2, RoundingMode.HALF_UP);
                BigDecimal net       = gross.subtract(pf).subtract(tax);
                BigDecimal allowances = hra.add(transport).add(special);

                runBasic      = runBasic.add(basic);
                runAllowances = runAllowances.add(allowances);
                runDeductions = runDeductions.add(pf.add(tax));
                runNet        = runNet.add(net);

                SalaryStructure structure = isExec ? exec : std;

                Payslip ps = Payslip.builder()
                        .payrun(payrun)
                        .employee(c.getEmployee())
                        .contract(c)
                        .salaryStructure(structure)
                        .periodStart(periodStart)
                        .periodEnd(periodEnd)
                        .workedDays(22)
                        .basicWage(basic)
                        .totalAllowances(allowances)
                        .grossSalary(gross)
                        .totalDeductions(pf.add(tax))
                        .netSalary(net)
                        .status(PayslipStatus.PAID)
                        .pdfGenerated(true)
                        .emailSent(true)
                        .emailSentAt(Instant.now().minusSeconds(86400L * (monthsBack * 30 - 14)))
                        .build();
                payslips.add(ps);
            }

            List<Payslip> savedPayslips = payslipRepository.saveAll(payslips);

            // Payslip Lines — build in a single batch
            List<PayslipLine> lines = new ArrayList<>(savedPayslips.size() * 7);
            for (Payslip ps : savedPayslips) {
                boolean isExec = ps.getSalaryStructure().getCode().equals("EXEC-COMP");
                BigDecimal basic     = ps.getBasicWage();
                BigDecimal hra       = basic.multiply(BD(40)).divide(BD(100), 2, RoundingMode.HALF_UP);
                BigDecimal transport = isExec ? BD(5000) : BD(3000);
                BigDecimal special   = isExec ? basic.multiply(BD(15)).divide(BD(100), 2, RoundingMode.HALF_UP) : null;
                BigDecimal pf        = basic.multiply(BD(12)).divide(BD(100), 2, RoundingMode.HALF_UP);
                BigDecimal tax       = ps.getGrossSalary().multiply(isExec ? BD(20) : BD(10)).divide(BD(100), 2, RoundingMode.HALF_UP);

                lines.add(payslipLine(ps, "BASIC",     "Basic Wage",            SalaryRuleCategory.BASIC,     10, null,    basic));
                lines.add(payslipLine(ps, "HRA",       "House Rent Allowance",  SalaryRuleCategory.ALLOWANCE, 20, BD(40), hra));
                lines.add(payslipLine(ps, "TRANSPORT", "Transport Allowance",   SalaryRuleCategory.ALLOWANCE, 30, null,   transport));
                if (isExec && special != null) {
                    lines.add(payslipLine(ps, "SPECIAL", "Special Allowance",   SalaryRuleCategory.ALLOWANCE, 35, BD(15), special));
                }
                lines.add(payslipLine(ps, "GROSS",     "Gross Salary",          SalaryRuleCategory.GROSS,     40, null,   ps.getGrossSalary()));
                lines.add(payslipLine(ps, "PF",        "Provident Fund",        SalaryRuleCategory.DEDUCTION, 50, BD(12), pf));
                lines.add(payslipLine(ps, "TAX",       "Income Tax",            SalaryRuleCategory.DEDUCTION, 60, isExec ? BD(20) : BD(10), tax));
                lines.add(payslipLine(ps, "NET",       "Net Salary",            SalaryRuleCategory.NET,       70, null,   ps.getNetSalary()));
            }
            payslipLineRepository.saveAll(lines);

            // Update payrun aggregate totals
            payrun.setTotalBasic(runBasic);
            payrun.setTotalAllowances(runAllowances);
            payrun.setTotalDeductions(runDeductions);
            payrun.setTotalNet(runNet);
            payrun.setPayslipsCount(savedPayslips.size());
            payrunRepository.save(payrun);
        }

        // Active month: DRAFT payrun (no payslips yet, awaiting computation)
        LocalDate currStart = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate currEnd   = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
        payrunRepository.save(Payrun.builder()
                .name("Payrun " + currStart.getMonth().name() + " " + currStart.getYear())
                .salaryStructure(std)
                .periodStart(currStart)
                .periodEnd(currEnd)
                .status(PayrunStatus.DRAFT)
                .build());
    }

    private PayslipLine payslipLine(Payslip ps, String code, String name, SalaryRuleCategory cat,
                                    int seq, BigDecimal rate, BigDecimal amount) {
        return PayslipLine.builder()
                .payslip(ps).ruleCode(code).ruleName(name)
                .category(cat).sequence(seq).rate(rate).amount(amount)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER RESOLVERS
    // ─────────────────────────────────────────────────────────────────────────

    private String resolveJobTitle(String dept, int idx) {
        return switch (dept) {
            case "Engineering"      -> switch (idx % 5) {
                case 0 -> "Senior Backend Engineer";
                case 1 -> "Frontend Engineer II";
                case 2 -> "DevOps Specialist";
                case 3 -> "QA Automation Engineer";
                default -> "Backend Engineer I";
            };
            case "Product & Design" -> idx % 2 == 0 ? "Product Manager" : "Senior UI/UX Designer";
            case "Sales & Marketing"-> idx % 2 == 0 ? "Enterprise Account Executive" : "Inbound SDR";
            case "Customer Support" -> idx % 2 == 0 ? "Tier-2 Technical Support Specialist" : "SysAdmin";
            case "Finance"          -> idx % 2 == 0 ? "Payroll Analyst" : "Financial Analyst";
            case "Human Resources"  -> idx % 2 == 0 ? "Talent Partner" : "HR Operations Specialist";
            default                 -> "Associate";
        };
    }

    private BigDecimal resolveWage(String jobPosition, Role role) {
        if (role == Role.ADMIN)                                    return BD(380000);
        if (jobPosition.contains("VP") || jobPosition.contains("Chief")) return BD(280000);
        if (jobPosition.contains("Lead") || jobPosition.contains("Manager")) return BD(175000);
        if (jobPosition.contains("Senior") || jobPosition.contains("II"))   return BD(115000);
        if (jobPosition.contains("Analyst"))                       return BD(75000);
        return BD(55000);
    }

    private Role resolveIcRole(String dept, int idx) {
        if (dept.equals("Human Resources") && idx % 4 == 0) return Role.HR_MANAGER;
        if (dept.equals("Finance") && idx % 3 == 0)         return Role.HR_PAYROLL_USER;
        return Role.EMPLOYEE;
    }

    private String resolvePassword(Role role) {
        return switch (role) {
            case ADMIN              -> adminPasswordHash;
            case HR_MANAGER         -> hrPasswordHash;
            case HR_PAYROLL_MANAGER -> payrollMgrPasswordHash;
            case HR_PAYROLL_USER    -> payrollUserPasswordHash;
            default                 -> empPasswordHash;
        };
    }

    /** Pulls next name from the queue; refills + reshuffles when empty so we never run out. */
    private String nextName(List<String> queue) {
        if (queue.isEmpty()) {
            if (queue == firstNameQueue) {
                for (String n : FIRST_NAMES_POOL) queue.add(n);
            } else {
                for (String n : LAST_NAMES_POOL) queue.add(n);
            }
            Collections.shuffle(queue, rng);
        }
        return queue.remove(0);
    }

    private static BigDecimal BD(long val) {
        return BigDecimal.valueOf(val);
    }
}
