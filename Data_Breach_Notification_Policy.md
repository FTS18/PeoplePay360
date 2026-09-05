# PeoplePay360: Data Breach Response & Incident Notification Policy

**Document Reference:** SEC-POL-004
**Effective Date:** September 5, 2026
**Target Systems:** PeoplePay360 Platform Core, PostgreSQL Database Instances, Storage Volumes, and Background Payrun Engines

---

## 1. Purpose & Regulatory Scope

PeoplePay360 processes highly sensitive personal and financial data — employee master records, contracts, bank account details, and payroll figures. This Policy specifies the operational procedure for detecting, containing, triaging, and formally notifying stakeholders in the event of an unauthorized exposure, exfiltration, or breach of personal data managed within PeoplePay360, in line with applicable data protection law.

This Policy applies to PeoplePay360 Technologies Pvt. Ltd. as the Platform provider (Data Processor) and to Customers using PeoplePay360 to manage their own employee data (Data Fiduciary/Controller).

This Policy enforces mandatory compliance with:

- **Digital Personal Data Protection Act, 2023 (DPDP Act, India):** Statutory reporting of personal data breaches to the Data Protection Board of India and affected data principals.
- **CERT-In Cyber Security Directions (Section 70B of IT Act, 2000):** Mandatory incident reporting of unauthorized system compromise within six (6) hours of confirmation. This is a direct statutory obligation on PeoplePay360 as the system operator, independent of Customer instruction.
- **Contractual Service Obligations:** Prompt incident escalation to Customer corporate administrators (Data Fiduciaries).

## 2. What Counts as a Data Breach

A "Data Breach" is any confirmed incident resulting in the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or unauthorized access to personal data processed on the Platform, including but not limited to:

- Unauthorized access to Employee Master Data, Contracts, Attendance, or Time Off records
- Exposure, theft, or exfiltration of payroll data, including bank account details, IFSC codes, PAN, UAN/ESIC identifiers, or salary figures
- Compromise of login credentials or auth tokens leading to unauthorized role-based access or privilege escalation
- Accidental bulk email misdelivery of Payslip PDFs to incorrect recipients
- Infrastructure-level incidents (e.g., database compromise, unauthorized API access, exposed PDF download links) affecting Customer Data
- Loss of data due to system failure without adequate backup recovery

## 3. Breach Classification Matrix

| Severity Tier | Definition & Impact Criteria | Typical Impacted Data | Internal Response Window |
|---|---|---|---|
| **Tier 1 (Critical)** | Active external exfiltration or unauthenticated public exposure of multi-tenant databases or credential stores | Bank account numbers, IFSC, PAN, salary figures, and auth tokens | Immediate containment; internal response team assembled within ≤ 30 minutes |
| **Tier 2 (High)** | Single-tenant data leakage via permission failure, exposed PDF download links, or unauthorized internal role escalation | Employee profile records, attendance logs, itemized payslip PDFs | Mitigation within ≤ 2 hours |
| **Tier 3 (Medium/Low)** | Localized unauthorized access attempt blocked by application safeguards; credential stuffing with no successful account takeover | Encrypted token logs, masked metadata, non-sensitive operational telemetry | Remediation within ≤ 12 hours |

Payroll or bank-data incidents are automatically classified as Tier 1 or Tier 2 regardless of apparent scale, given data sensitivity.

## 4. Detection & Monitoring

We commit to:

- Instrumenting production servers and container clusters with automated threat detection monitoring error-rate spikes, anomalous egress bandwidth, and unauthorized database dump attempts
- Application-level pre-flight validation alarms flagging bulk extraction of payslips or database table scans exceeding standard payrun operational thresholds
- Maintaining audit logs of record access, creation, and edits across sensitive modules (Contracts, Salary Structures, Payruns, Payslips)
- Logging bulk actions such as "Send Payslips" email delivery to detect misdelivery incidents
- Periodically reviewing role-based access configurations to detect privilege misconfigurations

## 5. Incident Response Lifecycle

### Phase 1: Detection & Automated Alerting
Continuous monitoring and pre-flight trigger alarms surface anomalies per Section 4 for immediate triage by the on-call security team.

### Phase 2: Containment & Isolation
- **Access Revocation:** Immediate invalidation of compromised API keys, session secrets, and database credentials.
- **Network Segregation:** Affected multi-tenant database clusters and compute nodes are detached from public load balancers and shifted to an isolated sandbox VLAN for live forensic inspection.
- **Preservation of Evidence:** Live memory snapshots and immutable, read-only copies of application logs are preserved with cryptographic hashes to establish chain of custody.

### Phase 3: Investigation & Forensic Assessment
The Data Protection Officer (DPO) and Lead Security Engineer evaluate:
- The exact attack vector (e.g., misconfigured environment variable, SQL injection, token theft, misdelivery, privilege misconfiguration)
- The precise volume of records accessed or exfiltrated, distinguishing encrypted database tables from plaintext exposures
- Tenant identification, to determine which enterprise Customer accounts were affected
- Severity classification per Section 3

### Phase 4: Remediation
The vulnerability is patched, access revoked/rotated, and affected records restored or secured. All steps, timestamps, and decisions are logged for post-incident review and regulatory reporting.

## 6. Notification Obligations

### 6.1 Statutory & Contractual Timelines

```
[ Incident Confirmed ]
       │
       ├────▶ Within 6 Hours  ────▶ CERT-In (mandatory statutory filing by PeoplePay360)
       │
       ├────▶ Within 24 Hours ───▶ Subscribing Enterprise Admins (Employer / Data Fiduciary)
       │
       └────▶ Within 72 Hours ───▶ Data Protection Board of India & Impacted Employees
                                    (notified per the allocation in Section 6.2)
```

- **CERT-In Reporting (within 6 hours):** PeoplePay360 submits initial incident reporting via the official CERT-In portal, covering system IP addresses, incident type, and preliminary containment actions taken. This is PeoplePay360's own statutory obligation as system operator and is not delegated to the Customer.
- **Enterprise Customer Notification (within 24 hours):** Secure administrative notice dispatched to all designated primary contacts (`Admin` role) of affected Customer accounts, without undue delay and in no case later than 24 hours from confirmation.
- **Regulatory & End-User Notification (within 72 hours):** Notification to the Data Protection Board of India and to affected employees is completed within 72 hours of confirmation, per the responsibility allocation below.

### 6.2 Who Notifies Whom
- **Customer (Employer)** is notified first, as the Data Fiduciary/Controller, so it can meet its own legal obligations to affected employees and regulators. PeoplePay360 provides full incident detail (nature of breach, categories and volume of data affected, likely consequences, remediation steps taken) to support this.
- **Affected Employees:** By default, **Customer is responsible for notifying its own employees**, supported by the information and notification template PeoplePay360 provides. PeoplePay360 will notify affected employees directly only where separately agreed in the service agreement, or where the Customer is unresponsive or unable to notify within the applicable statutory window and PeoplePay360 determines direct notification is necessary to meet legal deadlines.
- **Data Protection Board of India:** As Data Fiduciary/Controller, Customer is generally responsible for regulatory notification to the Board regarding its own employees' data; PeoplePay360 provides the necessary incident details to support this. PeoplePay360 separately maintains its own CERT-In reporting obligation under Section 6.1, which is independent of the Customer's Board notification.

### 6.3 What the Notification Will Include
- Nature of the breach and categories of data affected
- Approximate number of individuals/records affected
- Likely consequences of the breach
- Measures taken or proposed to address the breach and mitigate harm
- Contact point for further information

## 7. Notification Template

When a formal notification is dispatched to impacted users (whether by PeoplePay360 or the Customer using this template), it should contain clear, factual operational details:

> **Subject:** [URGENT NOTICE] Security Incident Notification Regarding Your PeoplePay360 Account
> **Date of Notice:** [Insert Date]
> **Incident Reference:** SEC-INC-[YYYY]-[XXXX]
>
> **1. What Happened:**
> On [Date/Time], our security monitoring detected an unauthorized attempt to access our production storage cluster. We contained the exposure on [Date/Time] by invalidating all active tokens and blocking the unauthorized source IP address.
>
> **2. What Information Was Involved:**
> Our forensic review confirms that the following data fields associated with your profile were accessed: [List specific elements, e.g., Full Legal Name, Department, Bank Account Number, Salary Structure Details]. Password hashes and authentication credentials were not compromised.
>
> **3. Actions We Have Taken:**
> - Isolated the affected database cluster and deployed fixed validation rules.
> - Rotated all environment access secrets, database passwords, and encryption keys.
> - Engaged an independent forensic auditor and notified CERT-In[, and where applicable, the Data Protection Board of India].
>
> **4. Steps You Should Take:**
> - Review your bank accounts for unexpected transactions and notify your financial institution if you notice anomalies.
> - Be cautious of phishing emails or messages referencing your company or compensation details.
>
> **5. Contact & Support:**
> For questions or dedicated support regarding this incident, contact [our / your employer's] incident response team at [insert contact email].

## 8. Customer Responsibilities

Customers using PeoplePay360 must:

- Designate an internal contact (typically the `Admin` role) responsible for receiving breach notifications from PeoplePay360
- Promptly notify PeoplePay360 if they suspect a breach originating from their own credentials, misconfigured roles, or internal misuse
- Fulfill their own legal obligations to notify affected employees and relevant regulators where they are the Data Fiduciary/Controller, using the information and template PeoplePay360 provides
- Not disable or bypass audit logging and access control features provided by the Platform

## 9. Preventive Measures

To reduce breach risk, the Platform:

- Enforces the five-tier role-based access control model, restricting sensitive payroll and bank data to authorized roles only
- Applies immutable audit logging across contract, salary, and payslip modules
- Restricts manual attendance/payroll corrections to authorized users
- Encrypts data at rest (AES-256 for sensitive fields) and in transit (TLS 1.3)
- Surfaces pre-flight warnings (e.g., duplicate payslips, missing bank details) to reduce accidental data exposure during payroll finalization

## 10. Post-Incident Review & Preventative Fixes

- **Root Cause Analysis (RCA):** Within seven (7) business days of containment, the engineering team publishes a signed internal RCA detailing the vulnerability source, blast radius, and structural prevention steps.
- **Regression Testing & Schema Hardening:** Application updates addressing the exploit must include automated test coverage within the CI/CD pipeline preventing code merges that reintroduce the same access control vulnerability.
- **Annual Tabletop Simulation:** The platform engineering team conducts periodic (at minimum annual) data breach drills to verify notification pipelines and end-to-end operational readiness.
- Lessons learned are documented and this Policy, access controls, or monitoring systems are updated as needed.

## 11. Contact for Reporting a Suspected Breach

Any suspected breach should be reported immediately to:

**PeoplePay360 Technologies Pvt. Ltd. — Incident Response**
Email: privacy@peoplepay360.com
[Insert emergency contact number if applicable]

## 12. Changes to This Policy

This Policy may be updated periodically to reflect changes in law, Platform architecture, or operational practice. The "Effective Date" will be revised accordingly.

---

*This document is a template prepared for hackathon/demo purposes and does not constitute legal advice. Before production use, this Policy — including the notification timelines in Section 6 and the controller/processor responsibility allocation in Section 6.2 — should be reviewed by a qualified legal professional against the specific obligations applicable under India's Digital Personal Data Protection Act, 2023, the CERT-In directions, and any other jurisdictions in which the Platform or its Customers operate.*
