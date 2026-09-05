# PeoplePay360: Architectural Decision Records (ADR)

This document chronicles key architectural choices, evaluation rationale, and trade-offs made during the design and implementation of PeoplePay360.

---

## Index of Architectural Decisions

- [ADR-001: PostgreSQL & Neon Serverless as Primary Relational Datastore](#adr-001-postgresql--neon-serverless-as-primary-relational-datastore)
- [ADR-002: Monetary Arithmetic Precision with BigDecimal and NUMERIC(12,2)](#adr-002-monetary-arithmetic-precision-with-bigdecimal-and-numeric122)
- [ADR-003: GiST Temporal Range Exclusion Constraints for Contract Non-Overlap](#adr-003-gist-temporal-range-exclusion-constraints-for-contract-non-overlap)
- [ADR-004: Decoupling of Employee Personal Identity from Employment Contracts](#adr-004-decoupling-of-employee-personal-identity-from-employment-contracts)
- [ADR-005: Sequential Rule Evaluation Pipeline for Salary Structures](#adr-005-sequential-rule-evaluation-pipeline-for-salary-structures)
- [ADR-006: Finite State Machine (FSM) Governance for Payrun Lifecycle](#adr-006-finite-state-machine-fsm-governance-for-payrun-lifecycle)
- [ADR-007: Stateless JWT Security over Stateful HTTP Sessions](#adr-007-stateless-jwt-security-over-stateful-http-sessions)
- [ADR-008: Next.js 15 App Router with Hydration-Safe Architecture](#adr-008-nextjs-15-app-router-with-hydration-safe-architecture)
- [ADR-009: Immutable Itemized Payslip Line Ledger](#adr-009-immutable-itemized-payslip-line-ledger)

---

### ADR-001: PostgreSQL & Neon Serverless as Primary Relational Datastore

* **Status:** Accepted
* **Context:**
  Payroll and human resource management systems require transactional consistency across multiple tables (e.g., updating leave balances while adjusting attendance records, or finalizing a payrun while creating individual payslip vouchers). A non-relational database (e.g., MongoDB) introduces risks of partial updates and lack of referential integrity.
* **Decision:**
  Adopt PostgreSQL hosted on Neon Serverless. Neon provides compute-storage separation, connection pooling, and transactional ACID compliance.
* **Consequences:**
  - Strict foreign key referential integrity prevents orphan records.
  - ACID transactions ensure all-or-nothing operations via `@Transactional`.
  - Database migrations are version-controlled and automated via Flyway.

---

### ADR-002: Monetary Arithmetic Precision with BigDecimal and NUMERIC(12,2)

* **Status:** Accepted
* **Context:**
  Using IEEE 754 binary floating-point numbers (`float`, `double` in Java, or `FLOAT` in SQL) leads to fractional precision loss due to base-2 binary conversion (e.g., `0.1 + 0.2 = 0.30000000000000004`). In enterprise payroll, fractional penny discrepancies accumulate across hundreds of employees and violate financial compliance standards.
* **Decision:**
  Enforce `BigDecimal` across all backend service layers, entities, and DTOs. Database columns are typed as `NUMERIC(12, 2)` or `NUMERIC(14, 2)`. All currency divisions (proration formulas) specify `RoundingMode.HALF_UP` with 2-digit decimal scale.
* **Consequences:**
  - Completely eliminates binary floating-point rounding errors.
  - Guaranteed penny-accurate ledger calculations across gross, tax, deduction, and net values.

---

### ADR-003: GiST Temporal Range Exclusion Constraints for Contract Non-Overlap

* **Status:** Accepted
* **Context:**
  An employee must not have more than one active (`RUNNING`) contract at any given date. Relying solely on application-level checks leaves the system vulnerable to race conditions under concurrent requests.
* **Decision:**
  Implement a PostgreSQL table-level exclusion constraint using the `btree_gist` extension:
  ```sql
  CONSTRAINT exclude_contract_overlap EXCLUDE USING gist (
      employee_id WITH =,
      daterange(start_date, COALESCE(end_date, 'infinity'::date), '[]') WITH &&
  ) WHERE (status = 'RUNNING');
  ```
* **Consequences:**
  - The database guarantees temporal consistency even under high concurrency.
  - Any conflicting contract insertion or activation is immediately rejected with a SQL constraint violation error handled by the `GlobalExceptionHandler`.

---

### ADR-004: Decoupling of Employee Personal Identity from Employment Contracts

* **Status:** Accepted
* **Context:**
  In simple systems, salary and job position are embedded directly in the employee table. However, an employee's compensation, job position, and schedule evolve across promotions, department transfers, and wage reviews over time.
* **Decision:**
  Maintain separate `employees` and `contracts` tables. The `employees` table records enduring identity (name, email, bank details, tax PAN). The `contracts` table records temporal agreements (wage, job position, validity period, salary structure).
* **Consequences:**
  - Maintains a full historical audit trail of an employee's career and compensation changes.
  - Payruns link directly to the contract active during the settlement cycle rather than an unversioned employee record.

---

### ADR-005: Sequential Rule Evaluation Pipeline for Salary Structures

* **Status:** Accepted
* **Context:**
  Hardcoding payroll calculations into service classes creates rigid systems that break when statutory rates (such as Provident Fund or tax bands) change.
* **Decision:**
  Implement a sequential rule evaluation pipeline. Each `SalaryStructure` contains ordered `SalaryRule` entities (`sequence: 10, 20, 30...`). Rules compute amounts sequentially (Basic ➔ Allowances ➔ Gross ➔ Deductions ➔ Net) supporting computation types: `FIXED`, `PERCENTAGE`, and `FORMULA`.
* **Consequences:**
  - Enables adding or modifying allowances and deductions without altering backend Java code.
  - Each rule execution can reference previous rules as a computation base.

---

### ADR-006: Finite State Machine (FSM) Governance for Payrun Lifecycle

* **Status:** Accepted
* **Context:**
  Allowing payroll disbursement to trigger without verification can cause irrevocable bank disbursements based on incorrect attendance or unapproved leaves.
* **Decision:**
  Model Payrun execution as a deterministic state machine:
  ```text
  [DRAFT] ──► [COMPUTED] ──► [VALIDATED] ──► [PAID]
  ```
  State transitions are sequential and guarded. A payrun cannot jump from `DRAFT` directly to `PAID`.
* **Consequences:**
  - Transition from `DRAFT` to `COMPUTED` evaluates formulas and flags warnings.
  - Transition from `COMPUTED` to `VALIDATED` requires manager review.
  - Transition to `PAID` locks all payslips and payslip lines into an immutable state and stamps `paid_at`.

---

### ADR-007: Stateless JWT Security over Stateful HTTP Sessions

* **Status:** Accepted
* **Context:**
  Server-side sessions (e.g., `HttpSession` stored in server memory) limit horizontal scalability and require sticky sessions behind load balancers.
* **Decision:**
  Adopt stateless Spring Security with HMAC-SHA256 JSON Web Tokens (JWT). The token contains user ID, email, and role claims. The backend validates token signatures cryptographically on every request without performing database session lookups.
* **Consequences:**
  - Complete horizontal scalability with zero server session state.
  - Secure Role-Based Access Control (`ADMIN`, `HR_MANAGER`, `EMPLOYEE`) enforced at both gateway and controller levels.

---

### ADR-008: Next.js 15 App Router with Hydration-Safe Architecture

* **Status:** Accepted
* **Context:**
  Single Page Applications (SPAs) often suffer from slow initial page loads, SEO limitations, and layout re-renders on page transitions.
* **Decision:**
  Use Next.js 15 with App Router. Core navigation layout (Sidebar, TopBar) remains mounted across route changes. Dynamic data fetching uses custom API client interceptors. Currency formats on client components employ `suppressHydrationWarning` and skeleton loaders to eliminate server-client hydration mismatches.
* **Consequences:**
  - Instant client-side page transitions with zero layout shift.
  - Animated skeleton loaders prevent jarring data flashes during asynchronous network fetches.

---

### ADR-009: Immutable Itemized Payslip Line Ledger

* **Status:** Accepted
* **Context:**
  If salary structures or tax rules are updated in October, re-printing or querying a payslip from May must still reflect the exact rules and values evaluated in May.
* **Decision:**
  Persist an immutable `payslip_lines` record for every rule evaluated during payrun computation. Each line stores the evaluated `rule_code`, `rule_name`, `category`, `sequence`, and computed `amount`.
* **Consequences:**
  - Historical payslips remain permanent, audit-compliant financial snapshots that never change even if salary structures are updated in the future.
  - Eliminates the need to reconstruct historical calculations dynamically.
