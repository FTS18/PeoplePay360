# PeoplePay360: Video Recording Walkthrough & Presentation Flow

This document provides a scene-by-scene script, technical talking points, screen actions, and production guidelines for recording a video demonstration of the **PeoplePay360 Enterprise HR & Payroll Operations Platform**.

---

## 1. Pre-Recording Setup & Checklist

### 1.1 Environment Verification
- [ ] **Backend Service:** Spring Boot backend running on `http://localhost:8080` with PostgreSQL database active and seeded with enterprise dataset (260+ employees across 7 departments).
- [ ] **Frontend Application:** Next.js application running on `http://localhost:3000`.
- [ ] **Browser Settings:** Google Chrome or Chromium browser at 100% standard zoom, bookmarks bar hidden (`Ctrl+Shift+B`), full screen window (`F11` or maximized).
- [ ] **Display Resolution:** 1920x1080 (1080p) or 2560x1440 (1440p) at 60 FPS.
- [ ] **Audio & Microphone:** Crisp microphone input, noise suppression enabled, audio levels normalized between -12dB and -6dB.
- [ ] **Demo Credentials Ready:**
  - **Admin / HR Payroll Manager:** `admin@peoplepay360.com` / `Admin@123`
  - **HR Manager:** `vp.people@peoplepay360.com` / `HrManager@123`
  - **Standard Employee:** `emp26@peoplepay360.com` / `Employee@123`

---

## 2. Video Structure & Timing Overview

| Scene # | Scene Title | Focus Area | Recommended Duration |
| :--- | :--- | :--- | :--- |
| **Scene 1** | Platform Introduction & Problem Space | Landing Page, Architecture Overview | 0:00 – 0:45 |
| **Scene 2** | Security, RBAC & Multi-Role Authentication | `/login`, 5-Tier RBAC, JWT Auth | 0:45 – 1:30 |
| **Scene 3** | Executive 360 Dashboard & Guided Tour | `/dashboard`, KPIs, Onboarding Tour | 1:30 – 2:30 |
| **Scene 4** | Employee Master & 360 Profile Navigation | `/employees`, Kanban/Table, Smart Buttons | 2:30 – 3:45 |
| **Scene 5** | Contracts & Temporal Boundary Overlap Guard | `/contracts`, Single Running Constraint | 3:45 – 4:45 |
| **Scene 6** | Working Schedules & Shift Pattern Engine | `/schedules`, Automated Weekly Hours | 4:45 – 5:30 |
| **Scene 7** | Attendance Punch Clock & Manager Audit Override | `/attendance`, Clock In/Out, Audit Trail | 5:30 – 6:30 |
| **Scene 8** | Time Off Ledger & Overdraft Prevention | `/timeoff`, Requests, Allocations Ledger | 6:30 – 7:30 |
| **Scene 9** | Salary Structures & Sequential Rule Engine | `/payroll/structures`, `/rules`, SpEL Formulas | 7:30 – 8:45 |
| **Scene 10** | 2-Step Payrun Wizard & Financial State Machine | `/payroll/payruns`, Compute/Validate/Disburse | 8:45 – 10:30 |
| **Scene 11** | Itemized Payslips & Dynamic Server-Side PDF | `/payroll/payslips`, PDF Payslip Generation | 10:30 – 11:15 |
| **Scene 12** | Live System Settings, User Access & Compliance | `/settings`, `/users`, Legal/Privacy Docs | 11:15 – 12:00 |
| **Scene 13** | Conclusion & Engineering Highlights | Architectural Summary & Wrap-up | 12:00 – 12:30 |

---

## 3. Scene-by-Scene Detailed Demonstration Script

---

### Scene 1: Platform Introduction & Problem Space (0:00 – 0:45)
**URL:** `http://localhost:3000/` (Landing Page)  
**Primary Focus:** Value proposition, architecture problem statement, modern dark-theme UI.

#### On-Screen Actions:
1. Start recording on the **Landing Page** (`/`).
2. Smoothly scroll through the Hero Section, Enterprise Value Highlights, Feature Pillars, and Compliance Badges.
3. Pause on the interactive preview cards showcasing the HR and Payroll ecosystem.

#### Voiceover Script / Talking Points:
> *"Hello everyone! Welcome to the walkthrough of **PeoplePay360**, an enterprise-grade HR and Payroll Operations platform built to solve the most critical disconnect in modern workforce management: the fragmentation between HR master data, time tracking, leave accounting, and deterministic payroll processing.*
>
> *In traditional systems, HR data lives in static spreadsheets, attendance in biometric punch dumps, and payroll in detached month-end calculations. This causes broken leave overdrafts, retroactive salary disputes, mid-month contract confusion, and floating-point rounding errors.*
>
> *PeoplePay360 unites these domains into a single, transactional architecture powered by Spring Boot 3.x, PostgreSQL, Next.js, and an arbitrary-precision `BigDecimal` Sequential Rule Engine. Let's dive in!"*

---

### Scene 2: Security, RBAC & Multi-Role Authentication (0:45 – 1:30)
**URL:** `http://localhost:3000/login`  
**Primary Focus:** Stateless JWT authentication, 5-tier Role-Based Access Control (RBAC).

#### On-Screen Actions:
1. Click the **"Sign In"** button on the top-right navbar of the landing page.
2. Show the `/login` screen with clean authentication form and quick demo credential helper cards.
3. Type in `admin@peoplepay360.com` and `Admin@123`.
4. Click **"Sign In"** and transition into the protected dashboard.

#### Voiceover Script / Talking Points:
> *"Security in PeoplePay360 is enforced via stateless JWT Bearer tokens and a strict 5-tier Role-Based Access Control matrix:*
> 1. * **Employee:** Self-service portal for personal attendance punches, payslip downloads, and leave requests.
> 2. * **HR Manager:** Full authority over employees, contracts, schedules, and leave approvals, strictly isolated from financial disbursement.
> 3. * **HR Payroll User:** Operational payrun processing with read-only audit access to salary structures.
> 4. * **HR Payroll Manager:** Complete financial authority to configure salary rules, validate payruns, and trigger batch disbursements.
> 5. * **Platform Admin:** Full governance over users, roles, and global system parameters.
>
> *We will log in as the **Admin / HR Payroll Manager** to demonstrate the complete end-to-end operational flow."*

---

### Scene 3: Executive 360 Dashboard & Guided Onboarding Tour (1:30 – 2:30)
**URL:** `http://localhost:3000/dashboard`  
**Primary Focus:** Live business KPIs, period/department filtering, interactive widgets, onboarding tour.

#### On-Screen Actions:
1. Show the **Guided Onboarding Tour** modal / step-by-step tooltips highlight.
2. Point out the top **Filter Bar**: Switch Period (`Sep 2026`, `Aug 2026`, `Past 6 Months`) and Department filter (`Engineering`, `Sales & Marketing`, `Finance`).
3. Hover over the **Metric Cards**: Total Net Disbursed (₹), Payslips Generated, Attendance Health Ratio, Approved Leave Days.
4. Highlight the **Punch Clock Widget** on the right side for immediate employee check-in/out.
5. Scroll down to showcase:
   - **Department Cost Breakdown** bar chart.
   - **Payroll Trend** historical area chart.
   - **Payslip Status Pipeline** breakdown (`DRAFT`, `COMPUTED`, `VALIDATED`, `PAID`).
   - **Pre-flight Payroll Warnings Widget** flagging employees with missing bank details or unclosed attendance punches.

#### Voiceover Script / Talking Points:
> *"Upon login, administrators are greeted by the **Executive 360 Dashboard**. All metrics are computed dynamically from active database transactions.*
>
> *The top filter bar enables instant operational slicing by billing period and department. Notice how switching departments dynamically recalibrates our total salary commitments, average employee compensation, and attendance health ratio.*
>
> *Furthermore, our **Payroll Warnings Widget** proactively surfaces anomalies—such as unlinked bank accounts or open punch logs—long before month-end payroll execution, eliminating last-minute fire drills."*

---

### Scene 4: Employee Master Directory & 360 Profile Navigation (2:30 – 3:45)
**URL:** `http://localhost:3000/employees`  
**Primary Focus:** Dual Kanban/Table views, instant search/filtering, Employee 360 Profile with Smart Buttons.

#### On-Screen Actions:
1. Click **"Employees"** in the top navigation bar.
2. Show the **Kanban Card View** with employee avatars, job titles, department badges, and status indicators.
3. Toggle the view switcher to **Tabular List View**.
4. Use the search input: Type *"Priya"* or *"Nair"* to demonstrate instant search filtering.
5. Filter by Department (`Engineering`).
6. Click on an employee (e.g. `EMP002 - Priya Nair - Chief Technology Officer`) to open the **Employee 360 Profile Form**.
7. Highlight the **Smart Buttons** in the top-right header:
   - **Contracts (1)**: Live counter linked directly to active/historical contracts.
   - **Attendance Logs**: Quick jump to biometric punch records.
   - **Time Off Requests / Allocations**: Real-time leave ledger summary.
   - **Direct Reports**: Subordinate reporting tree.
8. Show the employee details: Work Email, Phone, Assigned Department, Manager, Job Position, Working Schedule, Bank Details, and PAN/Tax ID.

#### Voiceover Script / Talking Points:
> *"The **Employee Master Module** serves as the single source of truth. Administrators can toggle between a visual Kanban board and a high-density tabular list with instant multi-field filtering.*
>
> *Opening an employee profile reveals the **Employee 360 Architecture**. Instead of navigating through separate menus, **Smart Action Buttons** on the top right provide one-click contextual access to related contracts, attendance history, and leave allocations.*
>
> *Every profile captures critical identity, banking, and schedule metadata required for automated compliance."*

---

### Scene 5: Contracts & Temporal Boundary Overlap Guard (3:45 – 4:45)
**URL:** `http://localhost:3000/contracts`  
**Primary Focus:** Contract lifecycle, wage history, and single active running contract constraint.

#### On-Screen Actions:
1. Click **"Contracts"** in the top navigation bar.
2. Point out the contract list showing Contract Reference (`CON/2026/001`), Employee Name, Wage (₹), Structure, and Status (`RUNNING`, `DRAFT`, `EXPIRED`).
3. Click on a contract to inspect its details:
   - Wage breakdown (e.g., ₹280,000.00 / month).
   - Start Date, End Date (nullable for permanent roles).
   - Assigned Working Schedule and Salary Structure.
4. Explain the database constraint: Explain how the system prevents overlapping `RUNNING` contracts for the same employee, preserving historical audit trails when promotions occur.

#### Voiceover Script / Talking Points:
> *"Compensation in PeoplePay360 is governed by the **Contract Subsystem**. Workers undergo promotions, wage hikes, and probation transitions. Rather than destructively overwriting employee wage fields, every revision is tracked as a versioned contract record.*
>
> *The engine strictly enforces a critical financial invariant: **An employee cannot possess multiple overlapping `RUNNING` contracts during any pay cycle**.*
>
> *This guarantees that month-end calculation always binds to the exact contractual terms applicable to that calendar period."*

---

### Scene 6: Working Schedules & Shift Pattern Engine (4:45 – 5:30)
**URL:** `http://localhost:3000/schedules`  
**Primary Focus:** Dynamic weekly hours calculation, shift templates, Monday–Sunday line items.

#### On-Screen Actions:
1. Click **"Schedules"** (or access via Company/HR menu).
2. Show the configured schedule templates:
   - *Standard Full-Time (40h)*
   - *Support Shift (40h Rotational)*
   - *Part-Time Contractor (20h)*
3. Click into *Standard Full-Time (40h)* to view the Shift Pattern Builder:
   - Monday to Friday: `09:00` to `18:00` with `1.0` hour unpaid lunch break.
   - Point out that **Total Weekly Hours (40.00h)** and **Average Daily Hours (8.00h)** are computed mathematically from shift lines rather than manual error-prone input.

#### Voiceover Script / Talking Points:
> *"Before attendance can be evaluated, we must define expected working baselines. The **Working Schedules Module** provides flexible shift template configuration.*
>
> *Each schedule defines daily shift start times, end times, and unpaid break deductions. The backend service automatically calculates total weekly hours and standard daily baselines. These schedules directly drive attendance anomaly detection and proration calculations."*

---

### Scene 7: Attendance Punch Clock & Manager Audit Override (5:30 – 6:30)
**URL:** `http://localhost:3000/attendance`  
**Primary Focus:** Biometric punch logs, status categorization (`PRESENT`, `LATE`, `EXCEPTION`), Manager Audit Override modal.

#### On-Screen Actions:
1. Click **"Attendance"** in the main navigation.
2. Demonstrate the top **Quick Punch Widget**: Click *"Check In"* or *"Check Out"* to log an instant timestamped punch.
3. Review the Attendance Table:
   - Columns: Employee, Date, Check In, Check Out, Worked Hours, Status Badge (`PRESENT` in green, `LATE` in amber, `EXCEPTION` in red).
4. Select an attendance record with a missing check-out or anomaly.
5. Click **"Edit / Override"** to trigger the **Manager Audit Override Modal**:
   - Update the check-out timestamp.
   - Enter a mandatory override reason: *"Biometric scanner hardware timeout at main gate"*.
   - Click **"Save Override"**.
6. Point out that the record now reflects `manual_override = true` with the modifier's user ID permanently logged for compliance.

#### Voiceover Script / Talking Points:
> *"The **Attendance Engine** reconciles raw daily punches against the employee's assigned shift schedule.*
>
> *Punches are classified in real-time as `PRESENT`, `LATE` (if past the grace period), or `EXCEPTION` (for missing check-outs).*
>
> *When operational discrepancies occur, authorized HR Managers can execute a **Manual Audit Override**. The system mandates an explicit business reason, permanently logging the manager's ID to maintain immutable audit integrity for labor inspections."*

---

### Scene 8: Time Off Ledger & Overdraft Prevention (6:30 – 7:30)
**URL:** `http://localhost:3000/timeoff`  
**Primary Focus:** Time off types, requests approval workflow, Allocations Ledger with zero-overdraft enforcement.

#### On-Screen Actions:
1. Navigate to **"Time Off" -> "Requests"** (`/timeoff`).
2. Show the Requests table with employee names, leave types (PTO, Sick, Casual, Unpaid), date intervals, duration (days), and status (`PENDING`, `APPROVED`, `REFUSED`).
3. Click on a `PENDING` leave request and show the **Approval / Refusal Action Buttons**.
4. Click **"Approve"**: Show the status transition to `APPROVED`.
5. Navigate to **"Time Off" -> "Allocations"** (`/timeoff/allocations`).
6. Showcase the **Double-Entry Allocations Ledger**:
   - Total Allocated Days, Days Taken, and Remaining Balance.
   - Explain how approved leave automatically debits the allocation ledger, strictly preventing leave balance overdrafts.

#### Voiceover Script / Talking Points:
> *"Time Off management in PeoplePay360 operates on a **Double-Entry Allocation Ledger** model.*
>
> *Employees cannot simply book leave on a calendar; an allocation balance must be formally granted and approved by HR.*
>
> *When an HR Manager approves a leave request, the platform atomically validates and debits the remaining allocation. If an employee exhausts their balance, the system blocks further paid bookings, preventing unearned salary disbursement."*

---

### Scene 9: Salary Structures & Sequential Rule Engine (7:30 – 8:45)
**URL:** `http://localhost:3000/payroll/structures` & `/payroll/rules`  
**Primary Focus:** Sequential Rule Execution hierarchy, dynamic Spring Expression Language (SpEL) formulas, `BigDecimal` precision.

#### On-Screen Actions:
1. Navigate to **"Payroll" -> "Salary Structures"** (`/payroll/structures`).
2. Show configured structures: `Standard Corporate (STD-CORP)` and `Executive Compensation (EXEC-COMP)`.
3. Open `Standard Corporate` to display the ordered **Salary Rules Table**:
   - Sequence 10: `BASIC` | Category: `BASIC` | Type: `FIXED` (Mapped to Contract Wage)
   - Sequence 20: `HRA` | Category: `ALLOWANCE` | Type: `PERCENTAGE` (40% of BASIC)
   - Sequence 30: `TRANSPORT` | Category: `ALLOWANCE` | Type: `FIXED` (₹3,000.00)
   - Sequence 40: `GROSS` | Category: `GROSS` | Type: `FORMULA` (`BASIC + HRA + TRANSPORT`)
   - Sequence 50: `PF` | Category: `DEDUCTION` | Type: `PERCENTAGE` (12% of BASIC)
   - Sequence 60: `TAX` | Category: `DEDUCTION` | Type: `PERCENTAGE` (10% of GROSS)
   - Sequence 70: `NET` | Category: `NET` | Type: `FORMULA` (`GROSS - PF - TAX`)
4. Emphasize the strict ascending execution order and how upstream rules inject variables into downstream SpEL formula contexts.

#### Voiceover Script / Talking Points:
> *"Now, let's explore the core calculation engine: **Sequential Salary Rule Hierarchy**.*
>
> *Salary computation is not a single hardcoded equation. It is an ordered dependency pipeline executed in strict sequence.*
> - *Base wage is derived from the contract and attendance proration.*
> - *Allowances like HRA (40%) and Transport build upon the base.*
> - *Gross earnings aggregate total pay.*
> - *Statutory deductions like Provident Fund (12%) and Tax calculate off respective taxable bases.*
> - *Finally, Net Salary is resolved with non-negative bounds: $\max(0, \text{Gross} - \text{Deductions})$.*
>
> *Crucially, all operations utilize Java's arbitrary-precision `BigDecimal` with `RoundingMode.HALF_UP`, eliminating cumulative IEEE 754 floating-point penny rounding errors."*

---

### Scene 10: 2-Step Payrun Wizard & Financial State Machine (8:45 – 10:30)
**URL:** `http://localhost:3000/payroll/payruns`  
**Primary Focus:** Safe 2-step setup wizard, pre-flight warnings, state machine transitions (`DRAFT` -> `COMPUTED` -> `VALIDATED` -> `PAID`), batch payout, email dispatch.

#### On-Screen Actions:
1. Navigate to **"Payroll" -> "Payruns"** (`/payroll/payruns`).
2. Point out historical payruns already marked as `PAID`.
3. Click the **"+ New Payrun"** button to trigger the **2-Step Payrun Creation Wizard**:
   - **Step 1 (Scope Definition):**
     - Payrun Name: *"Payrun September 2026"*
     - Salary Structure: `Standard Corporate`
     - Period: `2026-09-01` to `2026-09-30`
     - Click **"Continue"** (Highlight that no ghost record is created in DB yet).
   - **Step 2 (Employee Batch Selection):**
     - Review the automatically filtered list of eligible employees holding active running contracts.
     - Select all or specific employees.
     - Click **"Create Payrun"**.
4. Land on the **Payrun Detail Processing Screen** (`/payroll/payruns/[id]`):
   - Highlight the **Pipeline Breadcrumb Banner**: `DRAFT -> COMPUTED -> VALIDATED -> PAID`.
   - Point out the **Pre-flight Warnings Alert** at the top.
   - Click **"Compute"**: Show loading state as the engine executes all salary rules across the batch inside a single atomic `@Transactional` boundary. Status updates to `COMPUTED`.
   - Review the generated employee payslips summary table with Gross, Deductions, and Net Salary.
   - Click **"Validate"**: Explain that this **locks the payrun**, freezing attendance and contract revisions for this cycle. Status updates to `VALIDATED`.
   - Click **"Mark Paid / Disburse"**: Status transitions to `PAID`. Aggregate disbursement metrics update instantly.
   - Click **"Send Payslips"**: Asynchronous email dispatch notifies all employees.

#### Voiceover Script / Talking Points:
> *"Executing payroll is a high-stakes financial event. PeoplePay360 implements a **Two-Step Transactional Payrun Wizard**.*
>
> *In Step 1, we define scope and structure. In Step 2, the system filters eligible workers holding valid running contracts for explicit confirmation before persisting the batch.*
>
> *Once created, the payrun follows a one-way **Financial State Machine** lifecycle:*
> 1. * **DRAFT:** Pre-flight checks inspect missing bank details and unapproved leave.*
> 2. * **COMPUTE:** Executes sequential rules and proration for all workers atomically. If any record fails, the entire batch rolls back.*
> 3. * **VALIDATE:** Locks the batch permanently against recalculation or tampering.*
> 4. * **PAID:** Finalizes fund disbursement and updates organizational ledgers.*
> 5. * **SEND PAYSLIPS:** Triggers asynchronous email delivery of itemized slips."*

---

### Scene 11: Itemized Payslips & Dynamic Server-Side PDF (10:30 – 11:15)
**URL:** `http://localhost:3000/payroll/payslips`  
**Primary Focus:** Payslip line breakdown, dynamic OpenPDF generation, instant PDF download.

#### On-Screen Actions:
1. Click on a specific payslip in the payrun table or navigate to `/payroll/payslips`.
2. Open an itemized payslip view:
   - Header with Employee Code, Name, Department, PAN, Bank Account, Working Days (e.g. 22 days).
   - Two-column Earnings vs. Deductions breakdown table.
   - Net Pay in bold currency representation (e.g., `₹ 2,49,400.00`).
3. Click the **"Download PDF"** button.
4. Open the downloaded PDF in browser/preview to show:
   - High-resolution corporate header: *PeoplePay360 Inc.*
   - Tax and bank details.
   - Formatted tabular lines for Basic, HRA, Transport, PF, and Tax.
   - Authorized digital signature footer.

#### Voiceover Script / Talking Points:
> *"Employees and payroll officers can inspect granular itemized payslips.*
>
> *Each payslip line details the exact rule code, category, rate percentage, and resulting amount.*
>
> *With a single click, our backend compiles a tamper-evident, high-resolution **PDF Payslip** on the fly using OpenPDF, complete with corporate branding, tax identifiers, bank routing numbers, and statutory deduction breakdowns ready for tax filing."*

---

### Scene 12: Live System Settings, User Access & Compliance (11:15 – 12:00)
**URL:** `http://localhost:3000/settings` & `/users`  
**Primary Focus:** Dynamic configuration keys in PostgreSQL, user administration, regulatory compliance pages.

#### On-Screen Actions:
1. Navigate to **"Settings"** (`/settings`):
   - Showcase live configurable parameters: Company Name, Currency Symbol (`₹`), Standard Working Days (`22`), PF Contribution (`12%`), Attendance Grace Period (`15 min`), Max Carry-Forward Leave (`5 days`).
   - Highlight that modifying these updates database configuration keys instantly without restarting backend services.
2. Navigate to **"Users"** (`/users`):
   - Show user accounts, active status toggles, and role assignments across the 5 RBAC tiers.
3. Show footer links to compliance policies:
   - Open `/privacy` (Privacy Policy & GDPR standards).
   - Open `/security` (SOC 2, ISO/IEC 27001, Encryption standards).

#### Voiceover Script / Talking Points:
> *"Platform governance is managed through **Live System Settings** and **User Administration**.*
>
> *Operational thresholds—such as standard monthly working days, provident fund percentages, attendance grace periods, and leave carry-over limits—are stored in PostgreSQL and dynamically read by the calculation engine.*
>
> *The platform adheres to strict data protection standards, including zero plain-text PII logging, BCrypt password hashing, and full GDPR and SOC 2 compliance readiness."*

---

### Scene 13: Conclusion & Engineering Highlights (12:00 – 12:30)
**URL:** Return to `http://localhost:3000/dashboard`  
**Primary Focus:** Recap of engineering architecture and closing remarks.

#### On-Screen Actions:
1. Transition back to the **Executive Dashboard**.
2. Perform a smooth, slow scroll over the live charts and metric cards.
3. Conclude the video with platform branding.

#### Voiceover Script / Talking Points:
> *"To summarize, **PeoplePay360** eliminates enterprise payroll failures by uniting:*
> - *Centralized Employee 360 Records and single-running contract enforcement,*
> - *Shift-calculated working schedules and audit-trailed attendance tracking,*
> - *Double-entry leave accounting with zero overdraft risks,*
> - *A deterministic BigDecimal sequential payroll engine with sandboxed SpEL rules, and*
> - *A safe, two-step transactional payrun wizard with instant PDF payslip generation.*
>
> *Thank you for watching! Check out our GitHub repository and documentation for complete architectural deep dives."*

---

## 4. Production & Recording Best Practices

### 4.1 Mouse Movement & Pacing
- Move the cursor smoothly and intentionally. Avoid rapid, erratic mouse gestures.
- When clicking a button or opening a modal, pause for **1 to 2 seconds** so viewers can register the UI transition and visual animations.
- Use zoom-in callouts in post-production when demonstrating formulas, SpEL syntax, or PDF payslip lines.

### 4.2 Narration & Tone
- Maintain a confident, professional, and articulate tone.
- Balance high-level business benefits (why this matters to HR and Finance) with technical depth (SpEL engine, BigDecimal, `@Transactional` boundaries).
- For bilingual/Hinglish presentations, refer to the Hindi/Hinglish cue sheet below.

---

## 5. Hinglish / Hindi Quick Cue Sheet (Optional)

If presenting the video in **Hinglish/Hindi**, use these natural talking points:

- **Intro:** *"Aaj hum dekhenge **PeoplePay360**, jo ek full-fledged Enterprise HR aur Payroll platform hai. Isme humne solve kiya hai traditional HR ka sabse bada problem—jaha employee data, biometric attendance, leave management, aur salary calculation alag-alag silos me hote the."*
- **Employee 360:** *"Har employee profile me **Smart Action Buttons** diye gaye hain, jisse aap ek click me active contracts, attendance history, aur leave balance dekh sakte hain."*
- **Attendance & Override:** *"Attendance me automatic shift calculation hai. Agar koi punch miss ho jata hai, to HR Manager mandatory reason ke sath **Manual Audit Override** kar sakta hai, jo audit log me save hota hai."*
- **Time Off Ledger:** *"Leave system double-entry ledger par chalta hai. Bina approved allocation ke koi leave apply nahi ho sakti, jisse balance overdraft ka risk zero ho jata hai."*
- **Payroll Engine & BigDecimal:** *"Payroll engine me standard floating-point numbers ke badle arbitrary-precision `BigDecimal` use kiya gaya hai taaki rounding errors na aaye. Rules sequential order me execute hote hain jaise Basic -> HRA -> Gross -> PF -> Tax -> Net Salary."*
- **Payrun Wizard:** *"Payrun create karne ke liye 2-step wizard hai. Compute -> Validate -> Mark Paid ke financial state machine ke through payroll process hota hai aur turant tamper-proof PDF payslips generate hoti hain."*

---

## 6. Video Chapter Markers (For YouTube / Loom Description)

```text
00:00 - Introduction & Problem Space
00:45 - 5-Tier RBAC & JWT Security
01:30 - Executive 360 Dashboard & Live Metrics
02:30 - Employee Master & 360 Profile Navigation
03:45 - Contract Lifecycle & Overlap Constraint Guard
04:45 - Working Schedules & Dynamic Hours Calculation
05:30 - Attendance Punch Clock & Manager Audit Override
06:30 - Time Off Ledger & Overdraft Prevention
07:30 - Salary Structures & Sequential Rule Engine
08:45 - 2-Step Payrun Creation Wizard & State Machine
10:30 - Itemized Payslip Breakdown & Server-Side PDF
11:15 - Live System Configuration & Compliance
12:00 - Summary & Technical Architecture Recap
```
