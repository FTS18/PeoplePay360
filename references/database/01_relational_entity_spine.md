# 1. Relational Entity Spine & Storage Separation

Operational logs (attendance, time off) flow into contract-governed salary templates, terminating in an immutable financial ledger.

![Relational Entity Spine & Storage Separation](assets/01_relational_entity_spine.png)

---

## Entity Architecture Diagram

```text
               ┌────────────────────────────────────────────────────────┐
               │                       EMPLOYEES                        │
               │  id, employee_code, first_name, last_name, email       │
               └──────────────┬───────────────────────────┬─────────────┘
                              │ 1:N                       │ 1:N
                              ▼                           ▼
  ┌──────────────────────────────────────────┐   ┌──────────────────────────────────────────┐
  │         ATTENDANCE_RECORDS               │   │              LEAVE_REQUESTS              │
  │  (Partitioned by Range on `date`)        │   │  (GiST Overlap Constraint)               │
  │  date, check_in, check_out               │   │  start_date, end_date, leave_type_id     │
  │  actual_worked_hours, overtime_hours     │   └────────────────────┬─────────────────────┘
  └──────────────────────────────────────────┘                        │ N:1
                                                                      ▼
                                                         ┌──────────────────────────┐
                                                         │       LEAVE_TYPES        │
                                                         │  name, is_paid (BOOLEAN) │
                                                         └──────────────────────────┘
                              │
                              ▼ 1:N
               ┌────────────────────────────────────────────────────────┐
               │                       CONTRACTS                        │
               │  (GiST Overlap Exclusion Constraint)                   │
               │  start_date, end_date, base_wage                       │
               └──────────────┬───────────────────────────┬─────────────┘
                              │ N:1                       │ N:1
                              ▼                           ▼
  ┌──────────────────────────────────────────┐   ┌──────────────────────────────────────────┐
  │            WORKING_SCHEDULES             │   │            SALARY_STRUCTURES             │
  │  standard_weekly_hours                   │   │  code, name                              │
  └───────────────────┬──────────────────────┘   └────────────────────┬─────────────────────┘
                      │ 1:N                                           │ 1:N
                      ▼                                               ▼
  ┌──────────────────────────────────────────┐   ┌──────────────────────────────────────────┐
  │             SCHEDULE_SHIFTS              │   │               SALARY_RULES               │
  │  day_of_week (0-6), start_time, end_time │   │  sequence, code, category, formula       │
  └──────────────────────────────────────────┘   └──────────────────────────────────────────┘
                              │
                              ▼
               ┌────────────────────────────────────────────────────────┐
               │                 SETTLEMENT SNAPSHOT                    │
               │  PAYRUNS ──► PAYSLIPS (Draft/Finalized) ──► LINES      │
               │  (Guarded by PostgreSQL Immutability Triggers)         │
               └────────────────────────────────────────────────────────┘
```

---

## Architectural Breakdown

### 1. Central Entity Anchor (`EMPLOYEES`)
* Serves as the central operational pivot for all workforce operations.
* Maintains strict referential integrity with cascading constraints to operational and contractual history.

### 2. Operational Ingestion Layer
* **`ATTENDANCE_RECORDS` (Partitioned by Range on `date`):** Implements PostgreSQL declarative range partitioning by month/year on the `date` column. Prevents sequential scan bloat when aggregating high-volume biometric punch logs during payrun execution.
* **`LEAVE_REQUESTS` (GiST Overlap Constraint):** Uses PostgreSQL `btree_gist` extension to enforce an exclusion constraint:
  ```sql
  EXCLUDE USING gist (
      employee_id WITH =,
      daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('PENDING', 'APPROVED'));
  ```
  Guarantees that an employee cannot hold overlapping leave bookings at the database engine level.
* **`LEAVE_TYPES`:** Categorizes leave policies with an explicit `is_paid` boolean flag driving downstream payroll rule deductions.

### 3. Contract Governance & Compensation Template Layer
* **`CONTRACTS` (GiST Overlap Exclusion Constraint):** Enforces singular employment terms for any given calendar date:
  ```sql
  EXCLUDE USING gist (
      employee_id WITH =,
      daterange(start_date, COALESCE(end_date, 'infinity'), '[]') WITH &&
  ) WHERE (status = 'RUNNING');
  ```
  Eliminates the possibility of dual active compensation agreements during payroll evaluation.
* **`WORKING_SCHEDULES` & `SCHEDULE_SHIFTS`:** Models weekly work expectations (shift start/end, unpaid break minutes) and computes expected baseline standard hours.
* **`SALARY_STRUCTURES` & `SALARY_RULES`:** Encapsulates ordered computation rules (Basic, Allowances, Deductions, Gross, Net) evaluated in strict sequence order.

### 4. Settlement Snapshot Layer (Immutable Ledger)
* **`PAYRUNS` ──► `PAYSLIPS` (Draft/Finalized) ──► `PAYSLIP_LINES`:** Stores frozen mathematical snapshots of calculated payroll components.
* **PostgreSQL Immutability Triggers:** When `payslips.status` transitions to `finalized` or `paid`, a PostgreSQL trigger intercepts and aborts all `UPDATE` and `DELETE` attempts:
  ```sql
  CREATE OR REPLACE FUNCTION enforce_payslip_immutability()
  RETURNS TRIGGER AS $$
  BEGIN
      IF OLD.status IN ('finalized', 'paid') THEN
          RAISE EXCEPTION 'Cannot modify an immutable finalized payslip record (id: %)', OLD.id;
      END IF;
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```
  Guarantees total audit trail defense and strict parity between digital records and generated employee PDF statements.
