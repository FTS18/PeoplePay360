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
*   **Database Reference Architecture:** Comprehensive operational flows, schemas, slicing algebra, and concurrency guards in [Database Reference Architecture Documentation](docs/database/README.md):
    *   [01. Relational Entity Spine & Storage Separation](docs/database/01_relational_entity_spine.md)
    *   [02. Temporal Slicing & Boundary Clipping](docs/database/02_temporal_slicing_boundary_clipping.md)
    *   [03. Sequential Rule Evaluation Pipeline](docs/database/03_sequential_rule_evaluation_pipeline.md)
    *   [04. Concurrency Worker Queue & Immutability Guard](docs/database/04_concurrency_worker_queue_immutability_guard.md)
    *   [05. Interactive Proration & Pipeline Simulator](docs/database/05_proration_pipeline_simulator.md)

---

## 8. Installation & Setup Guide

PeoplePay360 can be run via **Docker Compose** (recommended for cross-platform reproducibility) or executed **bare-metal** on macOS and Windows workstations.

### 8.1 Prerequisites

| Component | Minimum Version | Verification Command |
|---|---|---|
| Docker & Docker Compose | 24.0+ / Compose v2.20+ | `docker --version && docker compose version` |
| Java Development Kit (JDK) | OpenJDK 21 LTS | `java -version` |
| Node.js & npm | Node.js 20.x LTS / npm 10.x | `node -v && npm -v` |
| PostgreSQL *(Local only)* | PostgreSQL 17.x | `psql --version` |
| Redis *(Local only)* | Redis 7.x | `redis-cli --version` |

---

### 8.2 Method 1: Docker Compose Setup (macOS & Windows)

This is the fastest method to provision the complete application stack (PostgreSQL, Redis, Spring Boot Backend, Next.js Frontend) with active volume persistence, health checks, and hot reload.

#### Step 1: Clone Repository & Configure Environment
```bash
git clone https://github.com/your-org/PeoplePay360.git
cd PeoplePay360

# Copy the example environment file
cp .env.example .env
```

> **Configuration Note:** For local development, `.env.example` contains working default secrets and database configurations. Update `JWT_SECRET` and SMTP credentials (`MAIL_USERNAME`, `MAIL_PASSWORD`) if email delivery or custom security parameters are required.

#### Step 2: Build & Start All Services
```bash
# Build images and start all 4 services in the foreground
docker compose up --build

# Or start in detached mode
docker compose up --build -d
```

#### Step 3: Verify Running Services
```bash
docker compose ps
```
All containers should report `healthy` or `running`:
*   `pp360_postgres` — Port `5432`
*   `pp360_redis` — Port `6379`
*   `pp360_backend` — Port `8080`
*   `pp360_frontend` — Port `3000`

#### Step 4: Access Application Endpoints
*   **Web Application:** `http://localhost:3000`
*   **Backend REST API:** `http://localhost:8080/api/v1`
*   **Swagger / OpenAPI UI:** `http://localhost:8080/api/v1/swagger-ui.html`
*   **PostgreSQL Direct:** `localhost:5432` (DB: `peoplepay360`, User: `pp360user`, Password: `pp360pass`)
*   **Redis Direct:** `localhost:6379`

#### Step 5: Stop or Reset Containers
```bash
# Stop containers while preserving database and build volumes
docker compose down

# Stop containers and wipe all persistent database and cache volumes
docker compose down -v
```

---

### 8.3 Method 2: Bare-Metal Setup (macOS)

#### Step 1: Install System Dependencies via Homebrew
```bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install runtime dependencies
brew install openjdk@21 node@20 postgresql@17 redis
```

#### Step 2: Configure PostgreSQL & Redis
```bash
# Start background services
brew services start postgresql@17
brew services start redis

# Create database and application user
psql postgres -c "CREATE USER pp360user WITH PASSWORD 'pp360pass' SUPERUSER;"
psql postgres -c "CREATE DATABASE peoplepay360 OWNER pp360user;"
```

#### Step 3: Run Spring Boot Backend
```bash
cd backend

# Configure environment variables
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/peoplepay360"
export DB_USER="pp360user"
export DB_PASSWORD="pp360pass"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
export CORS_ALLOWED_ORIGINS="http://localhost:3000"

# Compile and start backend server
./mvnw spring-boot:run
```

#### Step 4: Run Next.js Frontend
In a new terminal tab:
```bash
cd frontend

# Install Node dependencies
npm install

# Launch development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### 8.4 Method 3: Bare-Metal Setup (Windows)

#### Step 1: Hybrid Infrastructure via Docker (Recommended for Windows)
Running PostgreSQL and Redis natively on Windows requires manual service configuration. The recommended approach is to run storage services in Docker while running backend and frontend code directly in PowerShell/CMD:
```powershell
# Start only database and cache containers
docker compose up postgres redis -d
```

*Alternatively, if running standalone Windows installers for PostgreSQL 17 and Redis, ensure PostgreSQL is running on port `5432` with a database named `peoplepay360` and credentials `pp360user` / `pp360pass`.*

#### Step 2: Run Spring Boot Backend (PowerShell)
```powershell
cd backend

# Set environment variables for current PowerShell session
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/peoplepay360"
$env:DB_USER="pp360user"
$env:DB_PASSWORD="pp360pass"
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000"

# Compile and run backend using Maven wrapper
.\mvnw.cmd spring-boot:run
```

#### Step 3: Run Next.js Frontend (PowerShell)
In a separate PowerShell window:
```powershell
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 9. Production Docker Deployment

To deploy optimized, multi-stage production images with stripped debug layers, standalone Next.js output, resource constraints, and production security settings:

```bash
# Start production stack in background
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# View production status
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

---

## 10. Operational Docker CLI Commands

| Operation | Command |
|---|---|
| Stream all container logs | `docker compose logs -f` |
| Stream backend logs only | `docker compose logs -f backend` |
| Stream frontend logs only | `docker compose logs -f frontend` |
| Interactive shell in backend container | `docker compose exec backend sh` |
| Interactive PostgreSQL shell (psql) | `docker compose exec postgres psql -U pp360user -d peoplepay360` |
| Clean rebuild without cache | `docker compose build --no-cache` |
| Restart specific service | `docker compose restart backend` |
| Inspect container resource usage | `docker stats` |

---

## 11. Troubleshooting & Platform Notes

### Port Conflicts
*   **Port 5432 (PostgreSQL):** If a local PostgreSQL instance is already running on the host machine, stop it (`brew services stop postgresql@17` on macOS or `Stop-Service postgresql*` in Windows PowerShell), or change the host port mapping in `docker-compose.yml` (e.g., `"5433:5432"`).
*   **Port 8080 / 3000:** Ensure no other web servers or development processes occupy these ports before running `docker compose up`.

### Windows Docker Desktop File Watcher
*   On Windows host filesystems (NTFS), Linux inotify events inside Docker containers do not reliably fire across bind mounts. The development setup includes `WATCHPACK_POLLING=true` in `docker-compose.yml` to ensure Next.js hot-reloading works seamlessly on Windows.

### Apple Silicon (macOS M1/M2/M3/M4) Architecture
*   All images (`postgres:17-alpine`, `redis:7-alpine`, `eclipse-temurin:21-jdk`, `node:20-alpine`) provide native `linux/arm64` binaries, requiring zero Rosetta emulation.

