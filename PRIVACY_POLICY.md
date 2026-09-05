# Privacy Policy — PeoplePay360

**Effective Date:** September 5, 2026
**Entity:** PeoplePay360 Technologies Pvt. Ltd. ("PeoplePay360," "we," "our," "us," or the "Platform")
**Application Scope:** PeoplePay360 HR & Payroll Operations Web Platform, APIs, and Employee Self-Service Portals

---

## 1. Introduction & Context

PeoplePay360 is a multi-tenant, integrated Human Resource and Payroll operations platform that helps organizations ("Customer," "Employer") manage employee records, attendance, time off, and payroll processing.

This Privacy Policy explains how we collect, use, store, share, and protect personal data through the Platform. It applies to:

- **Employer Administrators** who configure and operate the Platform (HR Managers, HR Payroll Users, HR Payroll Managers, System Administrators)
- **Employees** whose data is processed within the Platform by their employer

By using PeoplePay360, you acknowledge the practices described in this Policy.

## 2. Who Controls Your Data

For most data on the Platform, **your employer (the Customer) is the Data Fiduciary/Data Controller**, and PeoplePay360 acts as the **Data Processor**, processing personal data only on the employer's instructions and for the purposes of providing the HR and Payroll service. Questions about how your specific employer uses your data should first be directed to your employer's HR department.

## 3. Personal Data We Process

### 3.1 Employee Master Data
- Full legal name, employee ID, date of birth, gender, work and personal email addresses, phone number, residential address
- Department, job title, manager, employment status
- Profile photo (if uploaded)

### 3.2 Contract & Employment Data
- Contract start/end dates, employment type, active and historical contract records
- Base wages, structured allowances, and salary structure assignment

### 3.3 Attendance & Working Schedule Data
- Check-in / check-out timestamps
- Geo-fencing / network access logs (if enabled by the employer)
- Worked hours, attendance status, manual punch adjustment logs
- Assigned working schedule (days, shift times, breaks)

### 3.4 Time Off Data
- Leave category, requested duration, approval/rejection status and timestamps, manager notes
- Leave balances, allocations, and validity periods

### 3.5 Payroll & Financial Data
- Salary computation details (basic pay, allowances, deductions, gross, net)
- Bank account numbers and IFSC/branch codes for payment processing
- Payslip history and payment status
- Statutory/tax-related identifiers where applicable (e.g., PAN, UAN/Provident Fund, ESIC registration numbers, as required under Indian law)

### 3.6 System & Usage Data
- Login activity, role/permission assignments
- Immutable audit logs of record creation, edits, and approvals, including user attribution, timestamp, and modification rationale

## 4. How We Use Personal Data

We (as processor, on the employer's behalf) use personal data to:

- Maintain employee records and employment history
- Calculate attendance, working hours, and leave balances
- Execute period-specific payroll runs mapped to active contract terms, computing gross-to-net earnings, prorating attendance hours, and processing loss-of-pay deductions
- Generate payslip PDFs and deliver them via email, optionally with password protection (e.g., DOB + last 4 digits of PAN) to prevent unauthorized interception
- Calculate statutory deductions under applicable laws (e.g., Employees' Provident Funds and Miscellaneous Provisions Act, Employees' State Insurance Act, Professional Tax rules, Income Tax TDS)
- Power the Payroll Dashboard and related HR/Payroll reporting and analytics (e.g., department-level headcount expenses, leave utilization, attendance health metrics)
- Enforce role-based access control across the Platform
- Run pre-disbursement validation checks to flag data-quality issues (e.g., missing or invalid bank details, duplicate payslips, negative net earnings, contract conflicts) before payroll finalization
- Comply with applicable labour, tax, and employment laws

We do **not** use employee personal data for advertising, and we do not sell, lease, or otherwise monetize personal data.

## 5. Legal Basis for Processing

Where applicable (e.g., under India's Digital Personal Data Protection Act, 2023 (DPDPA), or other applicable data protection law), personal data is processed on the basis of:

- **Performance of the employment contract** between the employee and employer
- **Legal obligation** (statutory payroll, tax, and labour compliance)
- **Legitimate interests** of the employer in operating HR and payroll functions
- **Consent**, where required (e.g., for optional profile photo uploads or geo-fencing attendance tracking)

## 6. Role-Based Access to Data

Access to personal data within the Platform is restricted according to role, with strict tenant-level isolation enforced across all database records to prevent cross-company data leakage in our multi-tenant environment.

| Role | Access Level |
|---|---|
| Employee | Own profile, attendance logs, leave balances, and personal payslips only |
| HR Manager | Full CRUD on Employees, Attendance, Contracts, Working Schedules, and Time Off; hard-restricted from viewing or executing salary calculations and payrun batches |
| HR Payroll User | HR Manager access + Create/Read/Update on Payruns/Payslips; read-only access to Salary Structures/Rules |
| HR Payroll Manager | Full CRUD across HR and Payroll modules, including configuration of salary calculation formulas, rule sequences, and statutory deduction policies |
| System Administrator | Full platform and system administration access, including user role assignments |

## 7. Data Sharing & Disclosure

We may share personal data with:

- **Your employer's authorized personnel**, as governed by role-based permissions above
- **Transactional email gateways / SMTP relay providers**, solely to deliver payslips via the bulk email distribution feature
- **Cloud infrastructure providers** (managed database, object storage for payslip PDF generation, and compute hosting), bound by confidentiality and data protection obligations
- **Government or regulatory authorities**, where required by law — disclosures are typically made directly by the employer using exportable system reports (e.g., to EPFO, ESIC, and Income Tax TRACES portals)

We do not share personal data with third parties for their own marketing purposes, and we do not sell personal data.

## 8. Data Retention

- **Active employment records** are retained for the duration of employment and Platform use by the employer, and maintained historically to support audit requirements for retroactive adjustments.
- **Financial and payrun records** are stored in read-only, immutable formats following payrun finalization, for a minimum statutory retention period of 8 years to comply with applicable Indian financial and labour audit frameworks (subject to the specific statutory requirements applicable to the employer).
- **Attendance and leave records** are retained per employer configuration and applicable law.
- **Upon commercial termination** of an employer's account, data is retained in cold storage for 60 calendar days to allow final data exports, following which database records and backups undergo secure deletion/cryptographic sanitization — except where longer retention is required by applicable statutory obligations.

## 9. Data Security

We implement technical and organizational measures to protect personal data, including:

- **Tenant isolation:** strict tenant-identifier segregation across all database tables to prevent cross-company data access
- **Encryption at rest:** sensitive attributes (bank account numbers, IFSC codes, PAN, UAN, and other statutory identifiers) are encrypted at rest using AES-256
- **Encryption in transit:** all traffic across internal APIs, external portals, and administrative views is enforced over TLS 1.3
- **Role-based access control** restricting data visibility by function, with authorization-gating on sensitive fields (e.g., bank details, salary data)
- **Immutable audit trails** for manual adjustments to attendance records, salary rule formulas, or payment authorizations, recorded with user attribution, timestamp, and rationale
- **Payslip protection:** optional password protection on system-generated payslip PDFs distributed via bulk email

No system is completely secure; we cannot guarantee absolute security but take reasonable steps consistent with industry practice.

## 10. Your Rights

Subject to applicable law, individuals may have rights to:

- Access the personal data held about them (available directly via self-service for profile, attendance, and leave-balance records)
- Request correction of inaccurate data
- Request deletion, subject to statutory retention requirements
- Withdraw consent, where processing is consent-based
- Raise a grievance regarding data handling

Corrections to banking records, wage terms, or attendance punch records must be submitted to the employer's HR Manager or System Administrator, who hold the authority to approve such modifications. For all other requests, employees should route inquiries through their employer's HR department in the first instance, as the employer is typically the Data Fiduciary/Controller.

## 11. International Data Transfers

[If applicable: describe whether data is hosted in India only, or transferred internationally, and the safeguards used, e.g., standard contractual clauses.]

## 12. Children's Data

The Platform is not intended for use by individuals under the legal working age and does not knowingly collect data from children.

## 13. Changes to This Policy

We may update this Privacy Policy from time to time. Material changes will be communicated to Customers, and the "Effective Date" will be revised accordingly.

## 14. Contact Us

For questions about this Privacy Policy, data practices, system vulnerability reports, or data protection officer (DPO) communications:

**PeoplePay360 Technologies Pvt. Ltd.**
Privacy Officer Email: privacy@peoplepay360.com


---

*This document is a template prepared for hackathon/demo purposes and does not constitute legal advice. Before production use, this policy should be reviewed by a qualified legal professional to ensure compliance with all applicable data protection laws (e.g., India's DPDPA 2023, and any other relevant jurisdictional requirements).*
