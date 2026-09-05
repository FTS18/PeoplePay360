# PeoplePay360: Payroll Engine & Mathematical Specification

This document details the mathematical models, rounding algorithms, sequential rule execution pipeline, and temporal boundary slicing implemented in the PeoplePay360 Salary Calculation Engine.

---

## 1. Mathematical Architecture & Precision Standards

Financial disbursements demand exact decimal representations. Standard 32-bit and 64-bit IEEE 754 binary floating-point numbers (`float` and `double`) introduce cumulative representation errors.

### The IEEE 754 Floating-Point Hazard

Binary floating-point arithmetic cannot precisely represent base-10 fractional quantities:

$$\frac{1}{10} = 0.0001100110011..._2 \text{ (repeating binary)}$$

```text
// IEEE 754 Floating-Point Inaccuracy Demonstration
double basic = 5000.10;
double allowance = 2000.20;
double gross = basic + allowance; // Evaluates to 7000.30000000000018189...
```

Across a monthly disbursement to 5,000 employees with multi-tiered allowances and statutory tax brackets, cumulative penny rounding discrepancies cause balance sheet mismatches and statutory non-compliance.

### The PeoplePay360 `BigDecimal` Standard

All salary computations utilize Java's arbitrary-precision `java.math.BigDecimal` with the following invariants:

1. **Explicit Scale:** Currency amounts are scaled to exactly 2 decimal places (`scale = 2`).
2. **Deterministic Rounding:** `RoundingMode.HALF_UP` (Round half towards nearest neighbor) is enforced on all division and rate application operations.
3. **Proration Ratios:** Multi-step ratios maintain an intermediate scale of 4 decimal places before being applied to monetary bases.

```java
BigDecimal proratedWage = contract.getWage()
        .multiply(prorationRatio)
        .setScale(2, RoundingMode.HALF_UP);
```

---

## 2. Temporal Boundary Slicing & Proration Model

When an employee joins mid-month, terminates before month-end, or has unpaid absence intervals, the salary engine calculates a dynamic **Proration Factor ($\Phi$)**.

### Mathematical Formulation

Given a payrun cycle $[T_{start}, T_{end}]$:

1. **Cycle Calendar Days ($D_{period}$):**
   $$D_{period} = \text{ChronoUnit.DAYS}(T_{start}, T_{end}) + 1$$

2. **Contract Active Interval $[S_{start}, S_{end}]$:**
   $$S_{start} = \max(C_{start}, T_{start})$$
   $$S_{end} = \min(C_{end}, T_{end})$$

3. **Active Span Days ($D_{active}$):**
   $$D_{active} = \max(0, \text{ChronoUnit.DAYS}(S_{start}, S_{end}) + 1)$$

4. **Proration Ratio ($\Phi$):**
   $$\Phi = \frac{D_{active}}{D_{period}} \quad (\text{Scale: 4, RoundingMode.HALF\_UP})$$

5. **Prorated Base Wage ($W_{prorated}$):**
   $$W_{prorated} = W_{contract} \times \Phi \quad (\text{Scale: 2, RoundingMode.HALF\_UP})$$

---

### Numerical Walkthrough: Mid-Month Joining

* **Payrun Period:** September 1, 2026 to September 30, 2026 ($D_{period} = 30$ days).
* **Employee Contract Start Date:** September 11, 2026 ($C_{start} = \text{2026-09-11}$, Permanent contract: $C_{end} = \text{null}$).
* **Monthly Base Wage:** $\$6,000.00$.

#### Calculation Steps:
1. $S_{start} = \max(\text{2026-09-11}, \text{2026-09-01}) = \text{2026-09-11}$
2. $S_{end} = \min(\text{2026-09-30}, \text{2026-09-30}) = \text{2026-09-30}$
3. $D_{active} = (30 - 11) + 1 = 20 \text{ active days}$
4. $\Phi = \frac{20}{30} = 0.6667$
5. $W_{prorated} = \$6,000.00 \times 0.6667 = \$4,000.20$

---

## 3. Sequential Rule Execution Hierarchy

Salary structures contain dynamic rule definitions executed strictly in ascending order of their `sequence` attribute ([`RuleSequenceOrchestrator.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/payroll/engine/RuleSequenceOrchestrator.java)).

```text
[ Salary Structure Rules Ordered by Sequence ASC ]
                          │
  ┌───────────────────────┴────────────────────────┐
  ▼ (Sequence 10)                                 ▼ (Sequence 20)
[ BASIC ]                                       [ HRA ALLOWANCE ]
  Amount: W_prorated                              Amount: BASIC * 0.40
  Accumulator: GROSS += BASIC                     Accumulator: GROSS += HRA
  Context: BASIC = Amount                         Context: HRA = Amount
                          │
  ┌───────────────────────┴────────────────────────┐
  ▼ (Sequence 30)                                 ▼ (Sequence 40)
[ PF DEDUCTION ]                                [ PROFESSIONAL TAX ]
  Amount: BASIC * 0.12                            Amount: Fixed $200.00
  Accumulator: DEDUCTIONS += PF                   Accumulator: DEDUCTIONS += PT
  Context: PF = Amount                            Context: PT = Amount
                          │
                          ▼ (Final Net Resolution)
                    [ NET SALARY ]
        NET = max(0, GROSS - DEDUCTIONS)
```

### Supported Computation Types

1. **`FIXED`:**
   Returns a predetermined fixed monetary value (e.g., standard allowances or flat professional tax).
2. **`PERCENTAGE`:**
   Evaluates a percentage against a specified base code in the dynamic evaluation context:
   $$\text{Amount} = \frac{\text{Context}[\text{BaseCode}] \times \text{Percentage}}{100}$$
3. **`FORMULA`:**
   Evaluated dynamically through [`SandboxedSpelEngine.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/payroll/engine/SandboxedSpelEngine.java).

---

## 4. Sandboxed Dynamic Formula Evaluation

To support complex company policies without recompiling the application, expressions are evaluated using Spring Expression Language (SpEL) restricted via `SimpleEvaluationContext.forReadOnlyDataBinding()`:

### Available Context Variables

| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `WAGE` | `BigDecimal` | Full contract monthly wage |
| `PRORATED_WAGE` | `BigDecimal` | Wage adjusted for active period days |
| `BASIC` | `BigDecimal` | Base wage accumulator |
| `GROSS` | `BigDecimal` | Running gross salary accumulator |
| `DEDUCTIONS` | `BigDecimal` | Running total deductions accumulator |
| `WORKED_DAYS` | `BigDecimal` | Biometric attendance verified shifts |
| `PERIOD_DAYS` | `BigDecimal` | Calendar days in billing period |
| `ACTIVE_DAYS` | `BigDecimal` | Days between contract start and period end |

### Sample Rule Expressions

* **House Rent Allowance (40% of Basic):**
  ```text
  #BASIC * 0.40
  ```
* **Provident Fund (12% of Basic):**
  ```text
  #BASIC * 0.12
  ```
* **Attendance-Prorated Performance Bonus:**
  ```text
  (#WORKED_DAYS >= 20) ? 500.00 : 0.00
  ```

---

## 5. Payrun State Machine & Immutability Lifecycle

Payruns follow a one-way state progression:

$$\text{DRAFT} \longrightarrow \text{COMPUTED} \longrightarrow \text{VALIDATED} \longrightarrow \text{PAID}$$

```text
       ┌──────────┐
       │  DRAFT   │ <── Initial initialization with period dates & salary structure
       └────┬─────┘
            │ action: compute()
            ▼
       ┌──────────┐
       │ COMPUTED │ <── Rules executed for all employees; Payslips and Lines generated
       └────┬─────┘
            │ action: validate()
            ▼
       ┌──────────┐
       │VALIDATED │ <── Locked against recalculation; Ready for disbursement
       └────┬─────┘
            │ action: pay()
            ▼
       ┌──────────┐
       │   PAID   │ <── Final state; Disbursed to employees; Audit trail sealed
       └──────────┘
```

### Immutability & Financial Safeguards

1. **Locked Status Rule:** Once a payrun enters `VALIDATED` or `PAID`, all mutating operations (`compute()`, contract edits, attendance overrides) targeting that period are blocked.
2. **Atomic Execution:** The computation of all payslips within a payrun runs inside an isolated Spring `@Transactional` block. If any single calculation fails, the entire payrun rolls back cleanly to prevent incomplete or asymmetric financial states.
3. **Non-Negative Invariant:** Net salary is guaranteed non-negative:
   $$\text{Net Salary} = \max(0, \text{Gross} - \text{Total Deductions})$$
