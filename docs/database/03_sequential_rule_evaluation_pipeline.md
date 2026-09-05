# 3. Sequential Rule Evaluation Pipeline

Calculated inputs from attendance and time off are injected into the salary rule engine. Rules run in strict numeric sequence, building upon the outputs of earlier steps.

---

## Execution Pipeline Diagram

```text
                       INPUT ENVELOPE
  ┌───────────────────────────────────────────────────────┐
  │  Contract Wage: $6,000  │  Proration: 1.0 (Full Month) │
  │  Worked Hours:  168h    │  Overtime Hours: 12h         │
  │  Unpaid Leave:  2 Days  │  Standard Hours: 160h        │
  └───────────────────────────┬───────────────────────────┘
                              │
                              ▼
                   EXECUTION STAGES (BY SEQUENCE)
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ [Seq 10] BASIC EARNING                                                   │
  │   Formula: Base Wage * Proration Ratio                                   │
  │   Result:  $6,000.00                                                     │
  └───────────────────────────┬──────────────────────────────────────────────┘
                              ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ [Seq 20] OVERTIME ALLOWANCE                                              │
  │   Formula: (BASIC / 160) * 1.5 * OT_HOURS                                │
  │   Result:  ($37.50 * 1.5) * 12h = $675.00                                │
  └───────────────────────────┬──────────────────────────────────────────────┘
                              ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ [Seq 30] UNPAID LEAVE DEDUCTION                                          │
  │   Formula: (BASIC / 30) * UNPAID_DAYS                                    │
  │   Result:  ($200.00) * 2 Days = -$400.00                                 │
  └───────────────────────────┬──────────────────────────────────────────────┘
                              ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ [Seq 40] STATUTORY TAX DEDUCTION                                         │
  │   Formula: (BASIC + OT - UNPAID_DED) * 0.20                              │
  │   Result:  ($6,000 + $675 - $400) * 0.20 = -$1,255.00                    │
  └───────────────────────────┬──────────────────────────────────────────────┘
                              ▼
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ [Seq 50] NET DISBURSEMENT                                                │
  │   Formula: GROSS - TOTAL_DEDUCTIONS                                      │
  │   Result:  $6,675.00 - $1,655.00 = $5,020.00                             │
  └──────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Stages & Dependency Chain

The computation pipeline executes ordered rules retrieved from `salary_rules` filtered by the payrun's `salary_structure_id` ordered by `sequence ASC`.

### 1. Ingestion of the Input Envelope
Before evaluation commences, the engine populates an isolated symbol evaluation context:
* `BASE_WAGE`: Extracted from applicable `contracts` slice ($6,000.00).
* `PRORATION_RATIO`: Derived from temporal slicing ($1.0$).
* `WORKED_HOURS`: Aggregated from `attendance_records` ($168.0\text{h}$).
* `STANDARD_HOURS`: Derived from `working_schedules` ($160.0\text{h}$).
* `OVERTIME_HOURS`: Calculated as $\max(0, WORKED\_HOURS - STANDARD\_HOURS)$ ($12.0\text{h}$).
* `UNPAID_DAYS`: Derived from boundary-clipped unpaid `leave_requests` ($2\text{ days}$).

---

### 2. Sequential Rule Execution

#### [Seq 10] BASIC EARNING (Category: `BASIC`)
* **Mathematical Formula:** $\text{BASE\_WAGE} \times \text{PRORATION\_RATIO}$
* **Calculation:** $\$6,000.00 \times 1.0 = \$6,000.00$
* **Symbol Export:** $\text{BASIC} = \$6,000.00$

#### [Seq 20] OVERTIME ALLOWANCE (Category: `ALLOWANCE`)
* **Mathematical Formula:** $\left(\frac{\text{BASIC}}{\text{STANDARD\_HOURS}}\right) \times 1.5 \times \text{OVERTIME\_HOURS}$
* **Calculation:** $\left(\frac{\$6,000.00}{160}\right) \times 1.5 \times 12 = \$37.50 \times 1.5 \times 12 = \$675.00$
* **Symbol Export:** $\text{OT} = \$675.00$, $\text{GROSS} = \text{BASIC} + \text{OT} = \$6,675.00$

#### [Seq 30] UNPAID LEAVE DEDUCTION (Category: `DEDUCTION`)
* **Mathematical Formula:** $\left(\frac{\text{BASIC}}{30}\right) \times \text{UNPAID\_DAYS}$
* **Calculation:** $\left(\frac{\$6,000.00}{30}\right) \times 2 = \$200.00 \times 2 = \$400.00$
* **Symbol Export:** $\text{UNPAID\_DED} = -\$400.00$

#### [Seq 40] STATUTORY TAX DEDUCTION (Category: `DEDUCTION`)
* **Mathematical Formula:** $(\text{BASIC} + \text{OT} - \text{UNPAID\_DED}) \times 0.20$
* **Calculation:** $(\$6,000.00 + \$675.00 - \$400.00) \times 0.20 = \$6,275.00 \times 0.20 = \$1,255.00$
* **Symbol Export:** $\text{TAX} = -\$1,255.00$, $\text{TOTAL\_DEDUCTIONS} = \$400.00 + \$1,255.00 = \$1,655.00$

#### [Seq 50] NET DISBURSEMENT (Category: `NET`)
* **Mathematical Formula:** $\text{GROSS} - \text{TOTAL\_DEDUCTIONS}$
* **Calculation:** $\$6,675.00 - \$1,655.00 = \$5,020.00$
* **Symbol Export:** $\text{NET} = \$5,020.00$

---

## Deterministic Immutability
Every calculated stage outputs a discrete line item row persisted directly into `payslip_lines` with explicit `sequence`, `code`, `name`, `category`, and `amount` attributes.
