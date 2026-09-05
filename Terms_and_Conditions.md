# Terms and Conditions of Service — PeoplePay360

**Effective Date:** September 5, 2026
**Product Entity:** PeoplePay360 Technologies Pvt. Ltd. ("PeoplePay360," "Service," "Platform," "We," "Us," or "Our")
**Governing Documents:** This Agreement operates alongside the PeoplePay360 Privacy Policy and Data Processing Addendum.

---

## 1. Acceptance of Terms & Account Creation

- **Binding Agreement:** By registering for, accessing, deploying, or utilizing the PeoplePay360 application, web dashboard, or associated APIs, the subscribing enterprise ("Customer," "Employer," or "Subscriber") and its authorized end users agree to be legally bound by these Terms and Conditions. If Customer does not agree, it must not use the Platform.
- **Enterprise Authority:** The individual creating the account represents and warrants that they possess the legal authority to bind the subscribing organization to these Terms.
- **Account Credential Integrity:** Users are strictly responsible for maintaining the confidentiality of their authentication credentials. Any operational action executed under an authorized account is deemed to be performed by the Customer.

## 2. Description & Scope of Service

PeoplePay360 grants the Customer a non-exclusive, non-transferable, revocable subscription to access a multi-tenant, cloud-based workforce administration and payroll calculation engine, unifying personnel administration, attendance tracking, leave management, and payroll processing into a single workflow, including:

- **Personnel & Contract Management:** Employee master data and directory management (Kanban/List/Form views), working schedule configuration, and tracking of historical or active employment contracts with period-specific payroll application.
- **Operational Time & Leave Administration:** Check-in/check-out logging, schedule-based attendance reconciliation, automated weekly hour calculation, time off type configuration, allocation ledgers, and approval workflows.
- **Payroll Execution:** Configuration of sequenced Salary Structures and Salary Rules, payrun creation (scope + employee selection) via a two-step wizard, computation, pre-flight validation warnings, disbursement-status marking, and payslip PDF generation/bulk email delivery.
- **Executive Dashboards:** Real-time reporting aggregating attendance health, leave consumption, and department-level compensation expenditure.

The Platform is provided "as is" for the Customer's internal HR and payroll operations. **The Platform does not itself remit statutory payments, file tax returns, transmit funds to employee bank accounts, or act as a payroll processor/employer of record**, unless separately agreed under a distinct agreement with an integrated payment/banking provider.

## 3. Role-Based Access Control (RBAC) & User Responsibilities

The Platform enforces a strict five-tier role-based access model to preserve separation of administrative duties:

| Role | Scope |
|---|---|
| Employee | Limited to viewing personal employment profile, attendance, and leave balances; submitting attendance punches and leave requests; retrieving individual payslips |
| HR Manager | Full CRUD over Employee Profiles, Contracts, Working Schedules, and Time Off / Leave Approvals. Expressly restricted from accessing or modifying salary structures, running payruns, or viewing finalized payslips |
| HR Payroll User | HR Manager permissions + authority to initiate and update Payrun batches and Payslips; read-only visibility into Salary Structures/Rules |
| HR Payroll Manager | Full CRUD across HR and Payroll modules, including creating/editing Salary Structures, rule formulas and sequences, payrun validations, and disbursement status flags |
| Admin | Full platform administration, user provisioning, and role/permission configuration |

**Separation of Duty:** Customer is solely responsible for assigning roles accurately. PeoplePay360 is not liable for data exposure or operational discrepancies resulting from role misconfiguration by Customer's administrators.

## 4. Customer Responsibilities

Customer agrees to:

- Ensure the accuracy and legality of all data entered into the Platform, including employee records, contracts, wage terms, and bank details
- Configure Salary Structures, Salary Rules, and Time Off Types in compliance with applicable labour, tax, and employment laws in its jurisdiction
- Review pre-flight warnings (e.g., missing bank details, overlapping active contracts, unclosed shift punches, duplicate payslip records) before validating and finalizing any Payrun
- Obtain any necessary consents from employees for the processing of their personal and payroll data on the Platform
- Not use the Platform to violate any applicable law, including wage, labour, or data protection regulations, and not attempt unauthorized reverse-engineering of the codebase or compromise multi-tenant platform security

## 5. Payroll Processing — Specific Terms

### 5.1 Master Data & Deterministic Calculation
PeoplePay360 functions as a deterministic execution engine. The accuracy of all calculated outputs (gross pay, net pay, deductions, tax withholding, and leave deductions) relies entirely on Customer-maintained master data, including active contract wages, shift definitions, and approved attendance logs. The Platform applies payroll calculations using the contract determined to be active for the selected pay period; Customer is responsible for ensuring contract records are accurate, non-overlapping, and updated promptly upon role, salary, or status changes.

### 5.2 Dynamic Rule Formulation & Sequential Calculation
The Platform allows authorized managers to define mathematical formulas, calculation categories (`Basic`, `Allowance`, `Gross`, `Deduction`, `Net`), and execution sequences (e.g., base wage → allowances → gross → statutory deductions → net pay). Customer is solely responsible for ensuring configured formulas comply with applicable labour laws, union agreements, and state-specific statutory guidelines. We are not responsible for incorrect outputs resulting from incorrectly configured or sequenced Salary Rules.

### 5.3 Pre-Flight Validation
The Platform provides automated pre-flight warning indicators (e.g., missing bank credentials, overlapping active contracts, unclosed shift punches, or duplicate payslip records). These warnings are an operational safety check only; Customer retains final responsibility for reviewing and confirming batch payruns before marking them validated or paid.

### 5.4 Finalization, Disbursement & Immutability
Validating a Payrun freezes computed figures and marks the batch as historical. Customer acknowledges that:

- Validation and "Mark Paid" actions are Customer-initiated and represent Customer's confirmation that payroll figures are correct
- The Platform does not itself transmit funds to employee bank accounts unless integrated with a separate payment/banking provider under a distinct agreement
- Once a Payrun batch is validated and marked `Paid`, historical payslips and ledger lines are frozen for audit compliance; corrective adjustments must be executed through subsequent payrun cycles or explicit reversing adjustments, not direct database modification

### 5.5 No Guarantee of Statutory Compliance
While the Platform supports configuration of statutory deduction categories (e.g., Provident Fund, ESI, Professional Tax, TDS), **Customer is solely responsible for ensuring that configured rules comply with applicable law** in its operating jurisdiction before funds are disbursed. We do not provide tax, legal, or accounting advice.

## 6. Data Ownership & Use

- Customer retains sole intellectual property rights and ownership over all Employee, Contract, Attendance, Time Off, and Payroll data entered into or generated within the Platform ("Customer Data").
- Customer grants PeoplePay360 a limited, worldwide license to host, process, and transmit Customer Data strictly as required to provide, maintain, and improve the Service, as further described in our Privacy Policy.
- We do not sell Customer Data or Employee personal data to third parties.
- Upon termination of service, Customer Data will be made available for export or deleted per Section 10 and any applicable statutory retention obligations.

## 7. Payslip Generation & Delivery

- The Platform generates payslip PDFs and supports bulk email delivery to employee work email addresses.
- Customer is responsible for ensuring employee email addresses on file are accurate and that delivery complies with applicable workplace communication policies.
- We are not liable for non-delivery, delay, or misdelivery caused by incorrect employee contact data, email provider outages, or Customer misconfiguration.

## 8. Fees, Subscriptions, and Billing

- **Pricing Structure:** PeoplePay360 is billed on a recurring B2B Per-Employee-Per-Month (PEPM) subscription model, determined by the total number of active employee records maintained within the Platform during each billing cycle.
- **Payment Terms:** Invoices are issued periodically in advance for the base subscription tier, with variable employee-count adjustments reconciled at the close of each billing cycle.
- **Taxes:** All fees are exclusive of applicable indirect taxes (such as Goods and Services Tax / GST), which will be added to invoices at the prevailing statutory rate.

## 9. Intellectual Property Rights

- **Platform Ownership:** PeoplePay360 Technologies Pvt. Ltd. retains all right, title, and interest in and to the Platform software, algorithms, rule execution mechanics, user interfaces, database designs, API schemas, and documentation. These Terms do not grant Customer any ownership rights in the Platform itself, only a right to use it as permitted herein.
- **Customer Data Ownership:** As described in Section 6, Customer retains ownership of its data, subject to the limited license granted to PeoplePay360 to deliver the Service.

## 10. Regulatory & Statutory Disclaimer

- **No Legal or Tax Advice:** PeoplePay360 provides operational and calculation workflow automation software. It does not provide certified legal, financial, accounting, or tax advisory services.
- **Statutory Compliance Responsibility:** Customer maintains ultimate legal accountability for verifying that statutory deductions — including Provident Fund (EPF), Employees' State Insurance (ESI), Professional Tax (PT), and Tax Deducted at Source (TDS) — comply with regional labour codes and tax authority guidelines before funds are disbursed.

## 11. Service Availability (SLA) & Technical Maintenance

- **Uptime Target:** PeoplePay360 targets an annual service availability uptime of 99.5%, excluding scheduled maintenance windows and force majeure events. The Platform is otherwise provided on an "as available" basis, without guarantee of uninterrupted or error-free operation.
- **Maintenance Windows:** Routine platform updates, database optimizations, and structural schema migrations will be scheduled during off-peak hours with advance administrative notification.
- [Insert additional support terms/response-time commitments if applicable.]

## 12. Limitation of Liability & Indemnification

- **Consequential Damages Exclusion:** To the maximum extent permitted by applicable law, PeoplePay360 shall not be liable for any indirect, incidental, special, punitive, or consequential damages, including loss of profits, business interruption, regulatory fines, or payroll disbursement delays caused by third-party banking networks, Customer-configured rules, inaccurate data entry, misassigned roles, or user error.
- **Liability Cap:** PeoplePay360's cumulative aggregate financial liability arising out of or related to this Agreement shall be strictly limited to the total fees actually paid by Customer to PeoplePay360 in the twelve (12) months preceding the incident giving rise to liability.
- **Statutory Carve-Out:** Nothing in this section limits liability that cannot be limited under applicable law (e.g., gross negligence, willful misconduct, or statutory employee protections).
- **Customer Indemnity:** Customer agrees to defend, indemnify, and hold harmless PeoplePay360 from any regulatory enforcement actions, labour disputes, or third-party claims arising from fraudulent employee records, unlawful wage deductions, misuse of the Platform, violation of applicable law, or incorrect formula configurations executed by Customer's authorized users.

## 13. Term, Suspension, and Termination

- **Term:** This Agreement commences upon the account creation date and continues until terminated by either party pursuant to the applicable subscription plan.
- **Suspension for Cause:** PeoplePay360 reserves the right to immediately suspend Platform access if Customer violates payment obligations, compromises multi-tenant platform security, or attempts unauthorized reverse-engineering of the codebase.
- **Post-Termination Data Retrieval:** Following termination, Customer shall have thirty (30) calendar days to export historical employee records, attendance archives, and generated PDF payslips. Following this transition period, PeoplePay360 will securely delete or cryptographically sanitize Customer's tenant database partitions in accordance with our data retention schedule and the Privacy Policy.

## 14. Changes to These Terms

We may update these Terms from time to time. Material changes will be communicated to Customer, and continued use of the Platform after such changes constitutes acceptance.

## 15. Dispute Resolution & Governing Law

This Agreement shall be governed by, construed, and enforced in accordance with the laws of India. Any legal action, dispute, or proceeding arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts located in [Insert City, e.g., Ahmedabad, Gujarat], India.

## 16. Contact Us

For questions about these Terms:

**PeoplePay360 Technologies Pvt. Ltd.**
Email: privacy@peoplepay360.com


---

*This document is a template prepared for hackathon/demo purposes and does not constitute legal advice. Before production use, it should be reviewed by a qualified legal professional to ensure enforceability and compliance with applicable law (e.g., Indian contract law, labour law, and the Digital Personal Data Protection Act, 2023).*
