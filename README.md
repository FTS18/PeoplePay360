# PeoplePay360: HR & Payroll Operations Platform

PeoplePay360 is an integrated enterprise platform engineered to unify personnel administration, operational time tracking, leave accounting, and deterministic payroll processing into a single, cohesive workflow.

---

## 1. Problem Space & Real-World Failures

In the majority of traditional enterprises and legacy HR platforms, personnel management and payroll calculation operate in isolated silos:
*   Employee data is stored as static contact records.
*   Attendance is tracked via independent biometric devices or basic spreadsheets without schedule context.
*   Time off requests are managed through generic ticketing queues without real-time entitlement validation.
*   Contracts and historical compensation changes are filed in unstructured document archives.
*   Payroll calculation is executed at month-end as an isolated calculation, often using detached spreadsheets.

This fragmentation produces critical operational failures in real organizations:

### 1.1 The Reality of Contract Evolution
An employee's contractual relationship is not static. Workers undergo role promotions, departmental transfers, annual salary increments, and probationary transitions. In traditional systems, updating a salary overwrites historical data, corrupting past audit trails. Furthermore, when a contract changes mid-month, legacy tools fail to determine which specific contract terms govern the exact calendar days of the payroll period, leading to incorrect compensation calculations or duplicate active contracts.

### 1.2 The Attendance-Compensation Disconnect
Standard payroll models assume uniform attendance baselines. However, work is dynamic: organizations utilize diverse shift schedules (standard 40-hour workweeks, flexible schedules, compressed shifts). Raw punch logs contain daily operational anomalies: missing check-outs, authorized late arrivals, unexcused tardiness, and overtime. Without real-time reconciliation against the employee's assigned working schedule, payroll administrators are forced to manually cross-reference punch logs with calendars, introducing calculation errors and compliance risks.

### 1.3 Unregulated Time Off and Balance Overdrafts
Basic portals treat leave as a simple calendar event. Enterprise workforce administration requires a double-entry balance accounting model. An employee cannot take paid leave unless an allocation balance has been granted and approved. When leave management is decoupled from payroll, workers often exhaust their balances without detection, forcing retroactive salary deductions that create employee disputes and violate labor regulations.

### 1.4 Sequential Calculation Fragility
Salary computation is an ordered dependency chain rather than a single formula:
1. Base wage is derived from the active contract and period attendance.
2. Allowances (e.g., House Rent Allowance, Transport Allowance) build upon base wage.
3. Gross earnings aggregate base and all allowances.
4. Statutory deductions (Provident Fund, Tax Withholdings, Social Security) depend on gross earnings or specific taxable components.
5. Unpaid leave penalties and voluntary deductions subtract from earnings to yield final Net Pay.
Executing these rules out of order or hardcoding values causes calculation errors when tax brackets or departmental compensation structures vary.

### 1.5 Irreversible Batch Execution Risks
Finalizing company-wide payroll is a high-stakes financial event. Legacy platforms calculate and commit payments simultaneously. If an employee has missing bank details, an overlapping payslip, or an unresolved attendance dispute, the entire batch fails or requires manual clawbacks after funds have been disbursed.

PeoplePay360 resolves these failure modes by placing the **Employee Record** at the center of all operations, directly connecting contracts, schedules, attendance, and leave ledgers into a sequenced, validated payroll engine.

---

## 2. Project Goals & Operational Scope

**Main Goal:**
Develop an integrated HR and payroll platform managing the full employee lifecycle—from master data and time tracking to payroll calculation and executive reporting.

### Key Outcomes
*   **Unified HR Flow:** Centralized employee records with instant, cross-module navigation to Contracts, Attendance, and Time Off.
*   **Contract Management:** Comprehensive historical record-keeping ensuring payroll calculation uses only the active, period-specific contract without concurrent active agreements.
*   **Operational Tracking:** Flexible working schedule templates, automated weekly hour computation, attendance tracking with exception handling, and allocation-backed time off workflows.
*   **Payroll Processing:** A two-step transactional payrun wizard (scope definition -> employee selection), sequenced salary rule evaluation, pre-flight validation warnings, and itemized payslip generation.
*   **Executive Intelligence:** A centralized Payroll Dashboard aggregating live operational data across periods, departments, and employee types.

---

## 3. User Roles & Access Control (RBAC)

The platform enforces a 5-tier access control structure ensuring strict separation of duty between general HR operations and sensitive financial payroll processing:

*   **Employee:** Self-service portal to view personal employee details, personal attendance logs, and available leave balances. Submit daily attendance punches and create Time Off requests. Zero access to administrative modules, contracts, or payroll functions.
*   **HR Manager:** Full CRUD access to Employee Master Management, Attendance Records, Contracts, Working Schedules, and Time Off modules. Authority to approve or refuse Time Off requests. Strictly isolated from payroll processing, salary structures, and payslips.
*   **HR Payroll User:** Inherits all HR Manager permissions. Granted operational access to create, view, and update Payruns and Payslips. Holds read-only access to Salary Structures and Salary Rules to audit computation logic without modification rights.
*   **HR Payroll Manager:** Complete administrative authority over both HR and Payroll domains. Full CRUD access to Payruns, Payslips, Salary Structures, and Salary Rules. Authority to validate payruns, trigger batch payouts, and configure compensation logic.
*   **Admin:** Complete platform administration. Manages user accounts, assigns roles, updates permission matrices, and oversees platform configuration.

---

## 4. Modules & Feature Breakdown

### A) HR Backend (Configuration & Master Data)

#### A1. Employee Master Management
*   Provides Kanban, List, and Form views for employee directory management.
*   Captures comprehensive work details: department, reporting manager, assigned working schedule, job position, and status (`Active`, `Inactive`).
*   Features quick list-view access and smart-button links directly on the employee profile to view filtered related Contracts, Attendance, and Time Off records.

#### A2. Contract Management
*   Maintains historical, dated contract records linked to employees to track promotions and compensation revisions over time.
*   List view displays contract references, dates, wages, and status, clearly highlighting the currently `Running` contract.
*   Contract forms capture complete terms: duration, department, position, wage, and assigned salary structure.
*   Enforces that payroll processes only the contract applicable to the selected pay cycle, strictly preventing concurrent active contracts.

#### A3. Working Schedule Setup
*   Implements List and Form views for organizational shift management, displaying schedule name, shift type, and weekly hours.
*   Form view defines the weekly schedule pattern using Day of Week, Shift Start Time, Shift End Time, and Unpaid Break duration in minutes.
*   Calculates total weekly hours automatically from the configured shift pattern rather than manual entry.
*   Assigns working schedules to employees or contracts to establish baseline attendance expectations.

#### A4. Time Off Type & Allocation Setup
*   Accessible from primary navigation, consolidating Requests, Allocations, and Configured Leave Types.
*   Time Off Types define organizational leave policies: measurement units (Days or Hours), allocation requirement flags, approval workflows, and payroll deduction rules.
*   Allocations manage employee balances on a ledger basis, requiring administrative approval before balances become available, while tracking taken, remaining, and validity windows.
*   Approved leave requests automatically decrement from assigned allocations, ensuring balances are consumed transparently.

#### A5. Salary Structure Setup
*   Acts as an organized container for collections of Salary Rules (e.g., "Regular Salaried Employee", "Executive Compensation").
*   List and Form views display associated details: rule counts, assigned employee volumes, and active status.
*   Form view manages included salary rules and enforces their execution sequence.
*   Selecting a structure on a Payrun dictates the exact rule set applied to compute employee payslips.

#### A6. Salary Rule Setup
*   Defines the mathematical calculation of earnings and deductions using List and Form views managing Name, Code, Category, and Sequence.
*   Categories provide clear accounting distinction: `Basic`, `Allowances`, `Gross`, `Deductions`, and `Net`.
*   Rules execute in strict sequential order to respect mathematical dependencies, allowing complex calculations to build upon upstream results.
*   Supports flexible computation types: fixed amounts, percentages of base rules, or dynamic formulas.

#### A7. Reporting & Dashboard Configuration
*   Integrates live operational data from HR, attendance, leave, and payroll modules.
*   Enables flexible filtering by Period and Department to analyze salary costs, attendance health, and leave trends.
*   Provides Employee Type filters (full-time, part-time, contractor) for focused departmental analysis.

---

### B) HR & Payroll Frontend (Operational Experience)

#### B1. Main Navigation & Employee Views
*   Global top navigation exposing: `Employees`, `Contracts`, `Attendance`, `Time Off`, `Payroll`, and `Reports`.
*   Employees accessible via visual Kanban cards or tabular List view, both drilling down into a unified Employee Form.

#### B2. Employee Form & Related Record Navigation
*   Employee Form displays identity, role, department, manager, schedule, contact details, and status.
*   Smart-button actions on the top-right display live counters and open filtered views for related Contracts, Attendance, Time Off requests, and Allocations.

#### B3. Attendance List & Form
*   Accessible globally from the main menu or directly from an individual Employee Form.
*   List view displays Check In, Check Out, Calculated Worked Hours, and Status (`Present`, `Late`, `Exception`) for rapid anomaly review.
*   Attendance Form provides detailed records and supports audit-logged manual corrections restricted to authorized HR managers.
*   Attendance data remains continuously available for reporting and dashboard analysis.

#### B4. Time Off Requests Workflow
*   Accessed via `Time Off -> Requests` in primary navigation.
*   Request List summarizes Employee, Leave Type, Dates, Duration, and Status.
*   Request Form details the application and supports a clean `Approve` or `Refuse` workflow.
*   Approved requests automatically reduce available balances for allocation-backed leave types.

#### B5. Payrun Creation Wizard
*   Clicking `NEW` launches a setup wizard instead of immediately generating a persistent database record.
*   *Step 1 (Scope):* Defines payroll scope, selecting target Salary Structure and Pay Period dates.
*   Clicking `Continue` advances to employee selection without creating the Payrun.
*   *Step 2 (Selection):* Filters and displays eligible staff holding active running contracts for explicit user confirmation.
*   Clicking `Create Payrun` initializes the batch containing only selected staff and opens the processing view.

#### B6. Payrun Processing Screen
*   Groups all generated payslips for the selected payroll period.
*   Form provides state-governed actions: `Compute`, `Validate`, `Mark Paid`, and `Send Payslips`.
*   Displays payrun reference, structure, period, status, and itemized summary of employee payslips.
*   Surfaces operational warnings (missing bank details, duplicate payslips, attendance exceptions) prior to finalization.
*   Preserves finalized and paid batches as immutable historical records.

#### B7. Payslip & Salary Computation Screen
*   Accessible from parent Payruns or from the dedicated Payslips list view.
*   Displays key identification attributes: Employee, Structure, Pay Run, Period, Status, and Worked Days.
*   Salary Computation section displays itemized rule breakdowns: Basic, Allowances, Gross, Deductions, and Net amounts.
*   Computation logic automatically utilizes the applicable period contract alongside the Payrun's assigned Salary Structure.

#### B8. Payslip PDF & Employee Delivery
*   *Print Payslip* generates an itemized, print-ready PDF statement for individual employees.
*   *Send Payslips* on the parent Payrun dispatches secure PDF payslips directly to employee work emails.

#### B9. Payroll Dashboard
*   **KPI Summary Cards:** Total Net Salary Paid, Payslips Generated, Average Salary, Approved Time Off, and Attendance Health Rate.
*   **Visual Analytics:** Salary Cost by Department (Bar Chart) and Monthly Net Salary Trends (Line Chart).
*   **Operational Alerts:** Surfaces unvalidated payroll runs, missing required employee information, duplicate payslips, and contracts nearing expiration.
*   **Attendance & Leave Overviews:** Tracks presence, overtime, approved days, pending requests, leave balance consumption, and missing check-outs.
*   **Departmental Breakdown:** Cross-references headcount against total salary expenditure per department.

---

## 5. Complete Flow (End-to-End)

1.  **Workforce Management:** Employees are created and managed via unified Kanban or List views, serving as the central operational hub.
2.  **Contracting & Scheduling:** Contracts and Working Schedules are linked to employees, ensuring payroll uses terms and shift patterns valid for the active cycle.
3.  **Time Tracking:** Attendance logs capture daily presence and exceptions, enabling authorized managers to review and rectify entries.
4.  **Leave Administration:** Leave types and allocations establish balance ledgers; employee requests are reviewed, approved, and deducted.
5.  **Compensation Configuration:** Salary Structures and sequenced Salary Rules define the mathematical calculation of earnings, deductions, and net pay.
6.  **Payrun Initiation:** Payroll officers launch the two-step wizard, specify the period and structure, and explicitly confirm eligible employees.
7.  **Batch Computation:** The system computes individual Payslips applying the applicable period contract, defined structure, and attendance records.
8.  **Audit & Warning Review:** Officers review computed payslip lines and system-generated pre-flight warnings before validation.
9.  **Locking & Disbursement:** Validating the payrun freezes financial figures; the run is marked as paid, individual PDF payslips are generated, and bulk email distribution is executed.
10. **Executive Analytics:** The Payroll Dashboard aggregates live operational data across HR, attendance, and payroll modules for strategic oversight.

---

## 6. Core Evaluation Pillars

*   **Unified HR & Payroll Workflow:** Demonstrates a seamless end-to-end employee-to-payslip lifecycle, connecting contracts, attendance, leave, and payroll into a single operational flow.
*   **Business Logic Complexity:** Solves real-world requirements including period-based contract selection, double-entry leave balance consumption, sequential salary rule dependencies, and automated pre-flight warning detection.
*   **Systems Architecture:** Implements industry-standard design principles: 5-tier role-based permissions, relational data integrity, historical record preservation, and real-time metric aggregation.
*   **Technical Versatility:** Built using a modern, scalable stack (Java Spring Boot backend, Next.js frontend, PostgreSQL database) prioritizing robust data modeling and calculation accuracy.

---

## 7. Design & Wireframes

*   **Official Wireframe Board:** [Excalidraw Functional Screen Flow](https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex)
*   **Technical Architecture Guide:** For full database entity definitions, API contracts, and project directory blueprints, refer to [AGENTS.md](AGENTS.md).

### Architecture & Engine Diagrams

#### System Domain Boundaries & Module Interconnects
![System Domain Architecture](docs/diagrams/system_domain_architecture.png)

#### Entity-Relationship & Relational Schema Architecture
![Database Schema Architecture](docs/diagrams/database_schema_diagram.png)

#### Deterministic Payrun Execution Pipeline
![Payrun Execution Pipeline](docs/diagrams/payrun_execution_pipeline.png)

