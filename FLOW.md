# PeoplePay360: Live Demonstration & Testing Guide

This guide provides a structured walkthrough for testing and demonstrating the end-to-end capabilities of PeoplePay360 during project evaluation and live reviews.

---

## 1. Pre-Flight System Verification

Before initiating the demonstration, verify that the environment services are running:

| Component | Target URL / Port | Technology | Health Check |
| :--- | :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3000` | Next.js 15 App Router | Loads login page / dashboard |
| **Backend REST API** | `http://localhost:8080/api/v1` | Spring Boot 3.x / Java 21 | Responds with JSON envelopes |
| **Database** | Port 5432 (Neon Cloud) | PostgreSQL 16 | Seeded baseline records present |

### Default Credentials
* **System Administrator:** `admin@peoplepay360.com` / `Admin@123`
* **HR Manager:** `hrmanager@peoplepay360.com` / `HrManager@123`
* **Payroll Officer:** `payrollmanager@peoplepay360.com` / `PayrollManager@123`
* **Employee:** `john.doe@peoplepay360.com` / `Employee@123`

---

## 2. Chronological Demonstration Narrative

The demonstration follows an enterprise workforce lifecycle: **Workforce Foundation ➔ Operational Logging ➔ Compensation Calculation ➔ Audit Settlement**.

```text
[ 1. Executive Dashboard ]
           │
           ▼
[ 2. Workforce & Contracts ] ──► (Verify Active Wage & Rule Link)
           │
           ▼
[ 3. Attendance Punch Clock ] ──► (Verify Daily Shift Logs & Overrides)
           │
           ▼
[ 4. Time-Off & Leave Ledger ] ──► (Approve Unpaid Leave for Proration)
           │
           ▼
[ 5. Payroll Engine Run ] ──► (DRAFT ➔ COMPUTED ➔ VALIDATED ➔ PAID)
           │
           ▼
[ 6. Itemized Payslip & PDF ] ──► (Verify Immutability & Audit Trail)
```

---

## 3. Step-by-Step Demonstration Walkthrough

### Stage 1: Executive Dashboard (Real-Time Operations)
* **URL:** `http://localhost:3000/dashboard`
* **Actions:**
  1. Showcase the top 4 **KPI Metric Cards**:
     - *Active Employees*: Total active workforce headcount.
     - *Running Contracts*: Active legal compensation agreements.
     - *Pending Leaves*: Time-off requests awaiting manager sign-off.
     - *Last Disbursed*: Net financial settlement from validated/paid payruns.
  2. Explain the **Salary Expenditure by Department** widget:
     - Filter by department dropdown (e.g., Engineering vs. Product) to demonstrate live client-side filtering without layout shift.
  3. Review the **Monthly Net Disbursement Trends** bar chart and **Today's Attendance Feed**.
* **Key Evaluator Talking Point:**
  > *"All metrics are computed directly from transactional database tables via PostgreSQL aggregation queries. The frontend uses animated skeleton loaders to ensure zero layout shift or numerical flickering during data loading."*

---

### Stage 2: Employee Master & Contract Management
* **URLs:** `http://localhost:3000/employees` and `http://localhost:3000/contracts`
* **Actions:**
  1. Open the **Employee Directory**:
     - Toggle between **Table View** and **Kanban View**.
     - Filter employees by department (e.g., Engineering).
     - Open an employee modal to show fields: Work Email, Tax Identification (PAN), Bank Account Number, IFSC/Routing Code, and assigned Working Schedule.
  2. Navigate to **Contracts**:
     - Point out the contract status indicators (`RUNNING`, `DRAFT`, `EXPIRED`).
     - Open a contract detail view: highlight the **Monthly Wage** and linked **Salary Structure**.
* **Key Evaluator Talking Point:**
  > *"We decouple Employee Profiles from Employment Contracts. An employee retains their enduring identity, while their contract governs their wage and active salary structure. PostgreSQL enforces a GiST temporal exclusion constraint preventing overlapping RUNNING contracts for the same employee."*

---

### Stage 3: Shift Schedules & Attendance Tracking
* **URLs:** `http://localhost:3000/attendance` and `http://localhost:3000/schedules`
* **Actions:**
  1. In **Schedules**, show the weekly template: Monday–Friday shifts (09:00 to 17:00 with 60-minute break times, total 40.00 hours/week).
  2. In **Attendance**:
     - Point out the interactive **Punch Clock Widget**: click *Punch In* or *Punch Out* to record a real-time timestamp.
     - Select an existing attendance record and trigger an **Attendance Override**:
       - Adjust the worked hours.
       - Enter a mandatory **Auditor Reason** (e.g., *"Badge reader hardware timeout"*).
       - Save and show that the record is marked with an override audit badge.
* **Key Evaluator Talking Point:**
  > *"Daily presence is validated against the employee's assigned schedule lines. Any manual modification requires an audit rationale and records the supervisor's identifier."*

---

### Stage 4: Leave Allocation & Time-Off Approvals
* **URL:** `http://localhost:3000/timeoff`
* **Actions:**
  1. Review the **Leave Balances Ribbon**: Paid Time Off (PTO), Sick Leave (SICK), and Unpaid Leave (UNPAID).
  2. Click **Apply Leave**:
     - Select an employee, leave category, and date range.
     - Submit the request.
  3. Review the **Leave Requests Table**:
     - Demonstrate approving a pending request.
     - Note that approval of an **Unpaid Leave** automatically marks the days as payroll-affecting for wage proration.
* **Key Evaluator Talking Point:**
  > *"Leave types are classified as either paid or payroll-affecting (loss of pay). When an unpaid leave is approved, the payroll engine automatically factors in missing days during payrun computation."*

---

### Stage 5: Payroll Run Execution (The Core Engine)
* **URL:** `http://localhost:3000/payroll/payruns`
* **Actions:**
  1. Click **Create Payrun**:
     - Provide a reference name (e.g., `Payrun September 2026`).
     - Choose the pay period (`2026-09-01` to `2026-09-30`) and select the `Standard Full-Time Structure`.
     - Click *Select All Active Staff* and initialize the payrun.
  2. Review the **Payrun Lifecycle Pipeline**:
     ```text
     [DRAFT]  ──►  [COMPUTED]  ──►  [VALIDATED]  ──►  [PAID]
     ```
  3. Click **Compute Payrun**:
     - The calculation engine evaluates each employee's base wage, schedules, attendance, and unpaid leaves.
     - Show the **Warnings Widget**: displays alerts for missing contracts, zero worked hours, or attendance discrepancies.
  4. Advance through **Validate** (manager review) and **Confirm Payout** (liquid disbursement).
* **Key Evaluator Talking Point:**
  > *"The payroll engine evaluates ordered salary rules sequentially: Basic ➔ Allowances ➔ Gross Salary ➔ Statutory Deductions ➔ Net Salary. The execution is wrapped in an atomic `@Transactional` boundary and guarded by a deterministic Finite State Machine."*

---

### Stage 6: Payslip Audit & PDF Generation
* **URL:** Inside Payrun Detail or `http://localhost:3000/payroll/payslips`
* **Actions:**
  1. Click any employee's payslip row in the payrun table.
  2. Open the **Payslip Detail Modal**:
     - Review the itemized earnings and deductions table.
     - Verify the worked days vs. unpaid days count.
     - Review statutory line items: Basic Wage, HRA, Provident Fund (PF), and Net Remuneration.
  3. Point out the **Download PDF** and **Send Email** action buttons.
* **Key Evaluator Talking Point:**
  > *"Every computed rule is recorded as an immutable row in the `payslip_lines` table. Historical payslips remain permanent financial snapshots that never recalculate even if salary structures are modified in subsequent months."*

---

### Stage 7: Role-Based Access Control (RBAC) Demonstration
* **Action:**
  1. In the sidebar footer, click the **Simulate Persona** dropdown.
  2. Switch from `System Admin` to `Employee (John Doe)`.
  3. Observe that the navigation menu immediately restricts access:
     - Admin-only routes (`Employees`, `Contracts`, `Payroll`, `Schedules`) are hidden.
     - Only self-service modules (`Dashboard`, `Attendance`, `Time Off`) remain accessible.
* **Key Evaluator Talking Point:**
  > *"The application enforces Role-Based Access Control across both the Next.js UI routing layer and Spring Security JWT filters on backend endpoints."*

---

## 4. Evaluator Q&A Reference

| Evaluator Question | Recommended Technical Response |
| :--- | :--- |
| **"Why not calculate salaries with double/float?"** | *"Binary floats cause IEEE 754 precision drift. We strictly enforce `BigDecimal` in Java and `NUMERIC(12,2)` in PostgreSQL with `RoundingMode.HALF_UP`."* |
| **"How is double-payment prevented on multiple clicks?"** | *"Payruns enforce unique `idempotency_key` tokens and unique compound constraints `(payrun_id, employee_id, contract_id)` on the payslip table."* |
| **"What happens if an unexpected exception occurs during batch payroll?"** | *"The entire batch runs inside a Spring `@Transactional` context. Any unhandled failure triggers a complete rollback to prevent partial or corrupted ledger records."* |
| **"Why is the frontend built with Next.js App Router?"** | *"App Router provides server-side rendering, route-level code splitting, persistent nested layouts (preventing sidebar re-renders), and hydration-safe caching."* |
