# PeoplePay360: Payroll Formula & Mathematical Calculation Specification

This document provides a comprehensive mathematical reference for all salary components, allowances, statutory deductions, proration factors, and rounding rules implemented in the PeoplePay360 payroll engine.

---

## 1. Sequential Rule Execution Hierarchy

Salary structures evaluate rules in strictly ascending order of their `sequence` integer. Every rule deposits its computed result into the shared evaluation context map, allowing downstream rules to reference upstream values.

```text
Contract Monthly Wage (W_contract)
            │
            ▼ (Proration Engine)
[ Sequence 10: BASIC ] ──────────► context["BASIC"] = W_prorated
            │
            ▼
[ Sequence 20: HRA ] ────────────► context["HRA"] = BASIC * 0.40
            │
            ▼
[ Sequence 30: TRANSPORT ] ──────► context["TRANSPORT"] = 3000.00 (Fixed)
            │
            ▼
[ Sequence 40: GROSS ] ──────────► context["GROSS"] = BASIC + HRA + TRANSPORT
            │
            ▼
[ Sequence 50: PF ] ─────────────► context["PF"] = BASIC * 0.12
            │
            ▼
[ Sequence 60: TAX ] ────────────► context["TAX"] = GROSS * 0.10
            │
            ▼
[ Sequence 70: NET ] ────────────► context["NET"] = max(0, GROSS - PF - TAX)
```

---

## 2. Component Formulas & Mathematical Definitions

### 2.1 Basic Wage (`BASIC`, Sequence 10)
* **Category:** `BASIC`
* **Computation Type:** `FIXED` (with dynamic cycle proration)
* **Mathematical Formula:**
  $$\text{BASIC} = W_{contract} \times \Phi$$
  *(Where $\Phi$ is the cycle proration factor, default $\Phi = 1.0000$ for full calendar attendance).*

---

### 2.2 House Rent Allowance (`HRA`, Sequence 20)
* **Category:** `ALLOWANCE`
* **Computation Type:** `PERCENTAGE`
* **Base Component:** `BASIC`
* **Rate:** $40.00\%$
* **Mathematical Formula:**
  $$\text{HRA} = \frac{\text{BASIC} \times 40}{100}$$

---

### 2.3 Transport Allowance (`TRANSPORT`, Sequence 30)
* **Category:** `ALLOWANCE`
* **Computation Type:** `FIXED`
* **Amount:** $₹3,000.00$
* **Mathematical Formula:**
  $$\text{TRANSPORT} = 3000.00$$

---

### 2.4 Gross Salary (`GROSS`, Sequence 40)
* **Category:** `GROSS`
* **Computation Type:** `FORMULA`
* **Expression:** `BASIC + HRA + TRANSPORT`
* **Mathematical Formula:**
  $$\text{GROSS} = \text{BASIC} + \text{HRA} + \text{TRANSPORT}$$

---

### 2.5 Employees' Provident Fund (`PF`, Sequence 50)
* **Category:** `DEDUCTION`
* **Computation Type:** `PERCENTAGE`
* **Base Component:** `BASIC`
* **Rate:** $12.00\%$
* **Mathematical Formula:**
  $$\text{PF} = \frac{\text{BASIC} \times 12}{100}$$

---

### 2.6 Income Tax / Tax Deducted at Source (`TAX`, Sequence 60)
* **Category:** `DEDUCTION`
* **Computation Type:** `PERCENTAGE`
* **Base Component:** `GROSS`
* **Rate:** $10.00\%$
* **Mathematical Formula:**
  $$\text{TAX} = \frac{\text{GROSS} \times 10}{100}$$

---

### 2.7 Net Salary Disbursed (`NET`, Sequence 70)
* **Category:** `NET`
* **Computation Type:** `FORMULA`
* **Expression:** `GROSS - PF - TAX`
* **Mathematical Formula:**
  $$\text{TOTAL\_DEDUCTIONS} = \text{PF} + \text{TAX}$$
  $$\text{NET} = \max(0.00, \text{GROSS} - \text{TOTAL\_DEDUCTIONS})$$
  *(Enforces the non-negative net disbursement invariant).*

---

## 3. Proration Factor ($\Phi$) & Mid-Month Boundary Slicing

When an employee starts or terminates mid-cycle, the base wage is scaled dynamically based on active calendar days:

### Mathematical Model
Given payrun cycle interval $[T_{start}, T_{end}]$ and contract active interval $[C_{start}, C_{end}]$:

1. **Cycle Calendar Days ($D_{period}$):**
   $$D_{period} = \text{ChronoUnit.DAYS}(T_{start}, T_{end}) + 1$$

2. **Active Interval Slicing:**
   $$S_{start} = \max(C_{start}, T_{start})$$
   $$S_{end} = \min(C_{end}, T_{end}) \quad (\text{if } C_{end} \neq \text{null, else } T_{end})$$

3. **Active Working Days ($D_{active}$):**
   $$D_{active} = \max(0, \text{ChronoUnit.DAYS}(S_{start}, S_{end}) + 1)$$

4. **Proration Factor ($\Phi$):**
   $$\Phi = \frac{D_{active}}{D_{period}} \quad (\text{Scale: 4, RoundingMode.HALF\_UP})$$

5. **Prorated Basic:**
   $$\text{BASIC} = (W_{contract} \times \Phi) \quad (\text{Scale: 2, RoundingMode.HALF\_UP})$$

---

## 4. Biometric Attendance Shift & Worked Hours Formulas

Attendance metrics are processed in [`AttendanceController.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/attendance/controllers/AttendanceController.java):

### 4.1 Worked Hours Calculation
$$M_{worked} = \text{Duration.between}(\text{checkIn}, \text{checkOut}).\text{toMinutes}()$$
$$\text{workedHours} = \frac{M_{worked}}{60.00} \quad (\text{Scale: 2, RoundingMode.HALF\_UP})$$

### 4.2 Half-Day Automatic Detection Threshold
$$\text{HalfDayThreshold} = \frac{\text{expectedHours}}{2.00}$$
$$\text{Status} = \begin{cases} \text{HALF\_DAY}, & \text{if } \text{workedHours} < \text{HalfDayThreshold} \\ \text{PRESENT}, & \text{if } \text{workedHours} \ge \text{HalfDayThreshold} \end{cases}$$
*(For an 8.00-hour shift, any shift under 4.00 hours triggers `HALF_DAY`).*

---

## 5. Numerical Worked Examples

### Scenario A: Full Month (Standard Execution)
* **Contract Wage:** $₹65,000.00$
* **Active Days / Period Days:** $30 / 30$ ($\Phi = 1.0000$)

| Sequence | Rule | Calculation | Line Amount |
| :---: | :--- | :--- | :---: |
| 10 | `BASIC` | $65,000.00 \times 1.0000$ | **$₹65,000.00$** |
| 20 | `HRA` | $65,000.00 \times 0.40$ | **$₹26,000.00$** |
| 30 | `TRANSPORT` | Flat fixed | **$₹3,000.00$** |
| 40 | `GROSS` | $65,000.00 + 26,000.00 + 3,000.00$ | **$₹94,000.00$** |
| 50 | `PF` | $65,000.00 \times 0.12$ | **$₹7,800.00$** |
| 60 | `TAX` | $94,000.00 \times 0.10$ | **$₹9,400.00$** |
| -- | *Total Deductions* | $7,800.00 + 9,400.00$ | *$₹17,200.00$* |
| 70 | `NET` | $94,000.00 - 17,200.00$ | **$₹76,800.00$** |

---

### Scenario B: Mid-Month Joining (Prorated Execution)
* **Contract Wage:** $₹60,000.00$
* **Cycle:** September 1, 2026 to September 30, 2026 ($D_{period} = 30$ days)
* **Start Date:** September 11, 2026 ($D_{active} = 20$ days)
* **Proration Factor:** $\Phi = 20 / 30 = 0.6667$

| Sequence | Rule | Calculation | Line Amount |
| :---: | :--- | :--- | :---: |
| 10 | `BASIC` | $60,000.00 \times 0.6667$ | **$₹40,002.00$** |
| 20 | `HRA` | $40,002.00 \times 0.40$ | **$₹16,000.80$** |
| 30 | `TRANSPORT` | Flat fixed | **$₹3,000.00$** |
| 40 | `GROSS` | $40,002.00 + 16,000.80 + 3,000.00$ | **$₹59,002.80$** |
| 50 | `PF` | $40,002.00 \times 0.12$ | **$₹4,800.24$** |
| 60 | `TAX` | $59,002.80 \times 0.10$ | **$₹5,900.28$** |
| -- | *Total Deductions* | $4,800.24 + 5,900.28$ | *$₹10,700.52$* |
| 70 | `NET` | $59,002.80 - 10,700.52$ | **$₹48,302.28$** |

---

## 6. Codebase Implementation References

* **Default Rule Population:** [`PayrollAndContractSeeder.java:61-67`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/config/PayrollAndContractSeeder.java#L61-L67)
* **Salary Calculation Orchestrator:** [`SalaryCalculationEngine.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/payroll/engine/SalaryCalculationEngine.java)
* **Formula Parsing & Evaluation:** [`FormulaEvaluator.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/payroll/engine/FormulaEvaluator.java)
* **Sandboxed Expression Context:** [`SandboxedSpelEngine.java`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/payroll/engine/SandboxedSpelEngine.java)
* **Attendance Punch Processing:** [`AttendanceController.java:63-95`](file:///c:/Users/dubey/OneDrive/Desktop/PeoplePay360/backend/src/main/java/com/peoplepay360/modules/attendance/controllers/AttendanceController.java#L63-L95)
