# PeoplePay360: Relational Database Schema Specification

This document provides a comprehensive technical reference for the 14 relational tables implemented in PostgreSQL for PeoplePay360. It details entity attributes, PostgreSQL data types, relational cardinality, integrity constraints, and operational design patterns.

---

## 1. Schema Architecture Overview

The system architecture organizes 14 relational entities across 4 interconnected functional domains:

```text
                           [ PostgreSQL Database ]
                                      │
    ┌───────────────────┬─────────────┴──────────────┬───────────────────┐
    ▼                   ▼                            ▼                   ▼
1. Workforce Master  2. Schedules & Attendance    3. Leave Management  4. Payroll Ledger
   ├── departments      ├── working_schedules        ├── time_off_types   ├── salary_structures
   ├── employees        ├── working_schedule_lines   ├── time_off_alloc.  ├── salary_rules
   └── contracts        └── attendance_records       └── time_off_reqs.   ├── payruns
                                                                          ├── payslips
                                                                          └── payslip_lines
```

---

## 2. Entity-Relationship Dependency Graph

```text
[departments] ◄──────┐
                     │ (FK: department_id)
[working_schedules] ─┼──────► [working_schedule_lines] (FK: schedule_id)
      │              │
      ├──────────────┼──────► [attendance_records] (FK: employee_id)
      │              │
      ▼              │
[employees] ◄────────┴──────► [contracts] ◄──────┐
      │                              │           │
      ├──────────────────────────────┼───────────┼──────────► [payslips] ◄── [payruns]
      │                              │           │                │              │
      │ (FK: employee_id)            │           │                ▼              ▼
      ▼                              ▼           │         [payslip_lines]  (FK: salary_structure_id)
[time_off_allocations]      [salary_structures] ─┴───────────────────────────────┘
      │                              ▲
      ▼                              │ (FK: structure_id)
[time_off_requests]          [salary_rules]
      │
      ▼ (FK: time_off_type_id)
[time_off_types]
```

---

## 3. Detailed Entity Definitions

### Domain 1: Workforce & Organization

#### 1. `departments`
Stores organizational business units responsible for cost centers and workforce grouping.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `code` | `VARCHAR(32)` | No | `UNIQUE` | Human-readable identifier (e.g., `ENG`, `FIN`, `HR`) |
| `name` | `VARCHAR(128)` | No | | Formal department title |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Audit timestamp of creation |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Audit timestamp of last modification |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 2. `employees`
Central employee master profile recording identity, role-based credentials, payment credentials, and manager hierarchy.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `employee_code` | `VARCHAR(32)` | No | `UNIQUE` | Unique organizational staff code (e.g., `EMP001`) |
| `first_name` | `VARCHAR(64)` | No | | Given name |
| `last_name` | `VARCHAR(64)` | No | | Family name |
| `work_email` | `VARCHAR(255)` | No | `UNIQUE` | Official enterprise email address |
| `password` | `VARCHAR(255)` | Yes | | BCrypt hashed authentication secret |
| `work_phone` | `VARCHAR(32)` | Yes | | Contact telephone number |
| `department_id` | `UUID` | Yes | `FK -> departments(id) ON DELETE RESTRICT` | Assigned organizational unit |
| `department` | `VARCHAR(100)`| Yes | | Denormalized department name for fast reads |
| `job_position` | `VARCHAR(100)`| No | | Functional role title (e.g., `Platform Admin`) |
| `role` | `VARCHAR(30)` | No | `DEFAULT 'EMPLOYEE'` | RBAC role (`ADMIN`, `HR_MANAGER`, `HR_PAYROLL_MANAGER`, `HR_PAYROLL_USER`, `EMPLOYEE`) |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'ACTIVE'` | Operational status (`ACTIVE`, `INACTIVE`) |
| `manager_id` | `UUID` | Yes | `FK -> employees(id) ON DELETE SET NULL` | Direct supervisor reference |
| `working_schedule_id` | `UUID` | Yes | `FK -> working_schedules(id) ON DELETE RESTRICT` | Default working calendar reference |
| `bank_account_number`| `VARCHAR(50)` | Yes | | Disbursal account number |
| `bank_name` | `VARCHAR(100)`| Yes | | Financial institution name |
| `bank_ifsc_or_routing`| `VARCHAR(30)`| Yes | | Bank routing code / IFSC code |
| `tax_id_or_pan` | `VARCHAR(30)` | Yes | | Statutory tax identifier (PAN / SSN) |
| `joining_date` | `DATE` | Yes | | First day of employment |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 3. `contracts`
Represents an enforceable employment agreement between company and employee. Controls the monthly wage and binds the employee to an active salary structure.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `reference` | `VARCHAR(50)` | No | `UNIQUE` | Unique contract reference (e.g., `CTR-EMP001-2026`) |
| `employee_id` | `UUID` | No | `FK -> employees(id) ON DELETE RESTRICT` | Associated employee |
| `department` | `VARCHAR(100)`| No | | Department under which agreement is valid |
| `job_position` | `VARCHAR(100)`| No | | Contractual job title |
| `salary_structure_id`| `UUID` | No | `FK -> salary_structures(id) ON DELETE RESTRICT` | Linked compensation rule set |
| `working_schedule_id`| `UUID` | No | `FK -> working_schedules(id) ON DELETE RESTRICT` | Expected working hours template |
| `wage` | `NUMERIC(12, 2)`| No | `CHECK (wage >= 0)` | Monthly base compensation amount |
| `start_date` | `DATE` | No | | Effective contract start date |
| `end_date` | `DATE` | Yes | `CHECK (end_date IS NULL OR end_date >= start_date)` | Contract expiry (null for permanent roles) |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'DRAFT'` | Status (`DRAFT`, `RUNNING`, `EXPIRED`, `CANCELLED`) |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

* **Table-Level Constraints:**
  - **GiST Temporal Exclusion Constraint:**
    ```sql
    CONSTRAINT exclude_contract_overlap EXCLUDE USING gist (
        employee_id WITH =,
        daterange(start_date, COALESCE(end_date, 'infinity'::date), '[]') WITH &&
    ) WHERE (status = 'RUNNING');
    ```
    *Guarantees an employee can never possess two simultaneous active contracts with overlapping date intervals.*

---

### Domain 2: Schedules & Attendance

#### 4. `working_schedules`
Defines operational weekly calendar templates used to compute expected worked hours and pay proration divisors.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `name` | `VARCHAR(64)` | No | | Schedule name (e.g., `Standard Full-Time (40h)`) |
| `type` | `VARCHAR(30)` | Yes | `DEFAULT 'FULL_TIME'` | Schedule category (`FULL_TIME`, `PART_TIME`, `SHIFT`) |
| `weekly_hours` | `NUMERIC(5, 2)` | No | `DEFAULT 40.00` | Total expected weekly hours |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 5. `working_schedule_lines`
Itemizes the individual daily shift intervals that compose a working schedule.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `schedule_id` | `UUID` | No | `FK -> working_schedules(id) ON DELETE CASCADE` | Parent schedule header |
| `day_of_week` | `SMALLINT` | No | `CHECK (day_of_week BETWEEN 1 AND 7)` | Day indicator (1 = Monday, 7 = Sunday) |
| `start_time` | `TIME` | No | | Daily shift commencement time |
| `end_time` | `TIME` | No | `CHECK (end_time > start_time)` | Daily shift conclusion time |
| `break_minutes` | `INT` | No | `DEFAULT 0` | Daily unpaid recess duration |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 6. `attendance_records`
Stores daily physical clock events, calculated hours, and manual overrides with auditor rationale.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `employee_id` | `UUID` | No | `FK -> employees(id) ON DELETE RESTRICT` | Subject employee |
| `date` | `DATE` | No | | Calendar date of attendance |
| `check_in` | `TIMESTAMPTZ` | Yes | | First ingress timestamp |
| `check_out` | `TIMESTAMPTZ` | Yes | | Final egress timestamp |
| `worked_hours` | `NUMERIC(5, 2)` | No | `DEFAULT 0.00` | Net computed hours on duty |
| `expected_hours`| `NUMERIC(5, 2)` | No | `DEFAULT 0.00` | Target shift hours per schedule |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'PRESENT'` | Presence classification (`PRESENT`, `LATE`, `EXCEPTION`, `ABSENT`) |
| `manual_override`| `BOOLEAN` | No | `DEFAULT FALSE` | True if modified by HR operator |
| `override_reason`| `TEXT` | Yes | | Mandatory rationale when manually adjusted |
| `reviewed_by_id`| `UUID` | Yes | `FK -> employees(id) ON DELETE SET NULL` | Auditor who authorized modification |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

* **Table-Level Constraints:**
  - `CONSTRAINT uq_attendance_emp_date UNIQUE (employee_id, date)`: Prevents multiple attendance records for an employee on the same date.

---

### Domain 3: Time-Off & Leave Management

#### 7. `time_off_types`
Configuration master defining leave classifications and their impact on payroll proration.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `code` | `VARCHAR(30)` | No | `UNIQUE` | Identifier (e.g., `PTO`, `SICK`, `UNPAID`) |
| `name` | `VARCHAR(100)` | No | | Category name (e.g., `Paid Time Off`) |
| `unit` | `VARCHAR(10)` | No | `DEFAULT 'DAYS'` | Measurement unit (`DAYS`, `HOURS`) |
| `requires_allocation`| `BOOLEAN` | No | `DEFAULT TRUE` | True if requires annual quota grant |
| `color_code` | `VARCHAR(10)` | Yes | | Color token for UI calendar representations |
| `is_paid` | `BOOLEAN` | No | `DEFAULT TRUE` | Remuneration eligibility indicator |
| `payroll_affecting` | `BOOLEAN` | No | `DEFAULT FALSE` | When true, approved requests prorate salary |
| `active` | `BOOLEAN` | No | `DEFAULT TRUE` | Availability flag |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 8. `time_off_allocations`
Ledger recording the entitlement quota granted to an employee for a specific leave category and validity period.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `employee_id` | `UUID` | No | `FK -> employees(id) ON DELETE RESTRICT` | Recipient employee |
| `time_off_type_id`| `UUID` | No | `FK -> time_off_types(id) ON DELETE RESTRICT` | Entitlement category |
| `allocated_units` | `NUMERIC(5, 2)` | No | `CHECK (allocated_units >= 0)` | Quantity of days/hours credited |
| `valid_from` | `DATE` | No | | Start of entitlement validity |
| `valid_to` | `DATE` | No | `CHECK (valid_to >= valid_from)` | End of entitlement validity |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'DRAFT'` | Allocation state (`DRAFT`, `APPROVED`, `REFUSED`) |
| `approved_by_id` | `UUID` | Yes | `FK -> employees(id) ON DELETE SET NULL` | Approving HR manager |
| `approval_date` | `TIMESTAMPTZ` | Yes | | Timestamp of authorization |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 9. `time_off_requests`
Operational transactional records representing employee leave applications.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `employee_id` | `UUID` | No | `FK -> employees(id) ON DELETE RESTRICT` | Applicant employee |
| `time_off_type_id`| `UUID` | No | `FK -> time_off_types(id) ON DELETE RESTRICT` | Requested leave category |
| `start_date` | `DATE` | No | | Leave start date |
| `end_date` | `DATE` | No | `CHECK (end_date >= start_date)` | Leave end date |
| `duration` | `NUMERIC(5, 2)` | No | `CHECK (duration > 0)` | Net calculated duration |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'CONFIRM'` | Request state (`CONFIRM`, `APPROVED`, `REFUSED`) |
| `reason` | `TEXT` | Yes | | Submitter remarks |
| `approved_by_id` | `UUID` | Yes | `FK -> employees(id) ON DELETE SET NULL` | Authorizing manager |
| `approval_date` | `TIMESTAMPTZ` | Yes | | Timestamp of decision |
| `rejection_reason`| `TEXT` | Yes | | Explanation when refused |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

### Domain 4: Salary Rules & Payroll Ledger

#### 10. `salary_structures`
Header entity for grouping reusable compensation rules.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `name` | `VARCHAR(100)` | No | | Structure label (e.g., `Standard Full-Time Structure`) |
| `code` | `VARCHAR(32)` | No | `UNIQUE` | Unique structure code |
| `description` | `TEXT` | Yes | | Explanatory notes |
| `is_active` | `BOOLEAN` | No | `DEFAULT TRUE` | Activation toggle |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 11. `salary_rules`
Itemized calculation directives evaluated sequentially by the payroll engine.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `structure_id` | `UUID` | No | `FK -> salary_structures(id) ON DELETE CASCADE` | Parent structure header |
| `name` | `VARCHAR(100)` | No | | Rule description (e.g., `Provident Fund`) |
| `code` | `VARCHAR(30)` | No | | Unique reference code (`BASIC`, `HRA`, `PF`, `NET`) |
| `category` | `VARCHAR(30)` | No | | Classification (`BASIC`, `ALLOWANCE`, `DEDUCTION`, `GROSS`, `NET`) |
| `sequence` | `INT` | No | `CHECK (sequence > 0)` | Sequential evaluation order (10, 20, 30, ...) |
| `computation_type`| `VARCHAR(20)`| No | | Math logic (`FIXED`, `PERCENTAGE`, `FORMULA`) |
| `percentage` | `NUMERIC(5, 2)` | Yes | | Multiplier factor when percentage-based |
| `percentage_base_code`| `VARCHAR(30)`| Yes| | Reference rule code used as multiplier base |
| `fixed_amount` | `NUMERIC(10, 2)`| Yes | | Static currency amount |
| `formula` | `TEXT` | Yes | | Formula expression string |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 12. `payruns`
Represents an organization-wide monthly batch payroll execution cycle.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `name` | `VARCHAR(100)` | No | | Period identifier (e.g., `Payrun September 2026`) |
| `salary_structure_id`| `UUID` | No | `FK -> salary_structures(id) ON DELETE RESTRICT` | Default structure applied |
| `period_start` | `DATE` | No | | Settlement cycle commencement date |
| `period_end` | `DATE` | No | `CHECK (period_end >= period_start)` | Settlement cycle conclusion date |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'DRAFT'` | State (`DRAFT`, `COMPUTED`, `VALIDATED`, `PAID`) |
| `total_basic` | `NUMERIC(14, 2)`| Yes | `DEFAULT 0.00` | Sum of base salaries across payslips |
| `total_allowances`| `NUMERIC(14, 2)`| Yes | `DEFAULT 0.00` | Sum of all discretionary additions |
| `total_deductions`| `NUMERIC(14, 2)`| Yes | `DEFAULT 0.00` | Sum of all statutory retentions |
| `total_net` | `NUMERIC(14, 2)`| Yes | `DEFAULT 0.00` | Total net liquid disbursement |
| `payslips_count` | `INT` | Yes | `DEFAULT 0` | Quantity of attached payslips |
| `paid_at` | `TIMESTAMPTZ` | Yes | | Bank disbursement completion timestamp |
| `idempotency_key` | `UUID` | No | `UNIQUE`, `gen_random_uuid()` | Prevents accidental duplicate disbursement |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

#### 13. `payslips`
Individual employee remuneration vouchers computed during a payrun.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `payrun_id` | `UUID` | No | `FK -> payruns(id) ON DELETE CASCADE` | Parent payrun batch |
| `employee_id` | `UUID` | No | `FK -> employees(id) ON DELETE RESTRICT` | Recipient employee |
| `contract_id` | `UUID` | No | `FK -> contracts(id) ON DELETE RESTRICT` | Contract terms in effect |
| `salary_structure_id`| `UUID` | No | `FK -> salary_structures(id) ON DELETE RESTRICT` | Applied rule structure |
| `period_start` | `DATE` | No | | Start of pay interval |
| `period_end` | `DATE` | No | | End of pay interval |
| `worked_days` | `INT` | No | `DEFAULT 0` | Net billable working days |
| `basic_wage` | `NUMERIC(12, 2)`| No | | Baseline contractual wage snapshot |
| `gross_salary` | `NUMERIC(12, 2)`| No | `DEFAULT 0.00` | Pre-tax total compensation |
| `total_allowances`| `NUMERIC(12, 2)`| No | `DEFAULT 0.00` | Sum of itemized allowances |
| `total_deductions`| `NUMERIC(12, 2)`| No | `DEFAULT 0.00` | Sum of itemized deductions |
| `net_salary` | `NUMERIC(12, 2)`| No | `DEFAULT 0.00` | Final net payable amount |
| `status` | `VARCHAR(30)` | No | `DEFAULT 'DRAFT'` | State (`DRAFT`, `COMPUTED`, `VALIDATED`, `PAID`) |
| `pdf_generated` | `BOOLEAN` | No | `DEFAULT FALSE` | True if server-side PDF has been rendered |
| `pdf_storage_path`| `TEXT` | Yes | | File system or object storage locator |
| `email_sent` | `BOOLEAN` | No | `DEFAULT FALSE` | True if emailed to employee |
| `email_sent_at` | `TIMESTAMPTZ` | Yes | | Timestamp of email dispatch |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

* **Table-Level Constraints:**
  - `CONSTRAINT uq_payrun_employee_contract UNIQUE (payrun_id, employee_id, contract_id)`: Prevents duplicate payslips for the same contract within a single payrun.

---

#### 14. `payslip_lines`
Immutable audit line items itemizing every rule computed on a payslip.

| Column | PostgreSQL Type | Nullable | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `gen_random_uuid()` | Unique entity identifier |
| `payslip_id` | `UUID` | No | `FK -> payslips(id) ON DELETE CASCADE` | Parent payslip voucher |
| `rule_code` | `VARCHAR(50)` | No | | Evaluated rule code (`BASIC`, `HRA`, `PF`, `NET`) |
| `rule_name` | `VARCHAR(100)` | No | | Rule descriptive name |
| `category` | `VARCHAR(30)` | No | | Ledger classification (`BASIC`, `ALLOWANCE`, `DEDUCTION`, `GROSS`, `NET`) |
| `sequence` | `INT` | No | | Execution sequence order |
| `rate` | `NUMERIC(5, 2)` | Yes | | Computed percentage rate (if applicable) |
| `amount` | `NUMERIC(12, 2)`| No | | Final monetary amount for this line item |
| `created_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | `DEFAULT NOW()` | Record update timestamp |
| `version` | `BIGINT` | No | `DEFAULT 0` | Optimistic locking counter |

---

## 4. Performance Indexes

| Index Name | Table | Indexed Columns | Index Type | Optimization Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `idx_emp_email` | `employees` | `work_email` | B-Tree | Fast JWT credential authentication lookup |
| `idx_emp_dept` | `employees` | `department_id`, `status` | B-Tree | Department-based headcount and roster queries |
| `idx_contract_emp_status`| `contracts`| `employee_id`, `status` | B-Tree | Fast active contract resolution during payruns |
| `idx_attendance_date_emp`| `attendance_records` | `date`, `employee_id` | B-Tree | Daily punch check-in and attendance feed |
| `idx_timeoff_emp_dates` | `time_off_requests` | `employee_id`, `start_date`, `end_date` | B-Tree | Fast leave overlap verification and calendar display |
| `idx_payslip_payrun` | `payslips` | `payrun_id` | B-Tree | Payrun batch voucher listing |
| `idx_payslip_emp_status`| `payslips` | `employee_id`, `status` | B-Tree | Employee portal payslip history |
| `idx_payslip_lines_parent`| `payslip_lines` | `payslip_id` | B-Tree | Fast payslip itemized breakdown loading |

---

## 5. Architectural Integrity Invariants

1. **Currency Precision:** All monetary fields (`wage`, `gross_salary`, `net_salary`, `amount`) are strictly defined as `NUMERIC(12, 2)` or `NUMERIC(14, 2)` to eliminate IEEE 754 floating-point inaccuracies.
2. **Contract Isolation:** GiST index with exclusion constraint ensures overlapping date ranges for `RUNNING` status on the same employee are rejected at the database level.
3. **Idempotency Protection:** Payrun generation and disbursement verify `idempotency_key` and unique compound index `(payrun_id, employee_id, contract_id)` to prevent double payments.
4. **Historical Audit Immutability:** When a payrun reaches `PAID` status, all related records in `payslips` and `payslip_lines` serve as permanent historical snapshots.
