# 2. Temporal Slicing & Boundary Clipping

When a mid-cycle contract revision or cross-month leave occurs, the engine uses set-based date intersection algebra to clip intervals to the active pay cycle (`2026-09-01` to `2026-09-30`).

---

## Calendar Timeline & Slicing Diagram

```text
Calendar Timeline: Sep 01                                 Sep 15              Sep 30          Oct 04
                   │────────────────────────────────────────│───────────────────│───────────────│
Pay Cycle Window:  [════════════════════════════════════════════════════════════]
                   ▲                                                            ▲
                   │                                                            │
Contract 1 (Old):  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] (Terminates Sep 14)
                   │  Slice 1: Active 14 Days (Proration = 14 / 30 = 0.4667)
                   │
Contract 2 (New):                                           [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] (Effective Sep 15)
                                                              Slice 2: Active 16 Days (Proration = 16 / 30 = 0.5333)

Leave Request:                                                              [███████████████████] (Sep 28 to Oct 04)
Clipped Result:                                                             [███] (Sep 28 to Sep 30)
                                                                            └── 3 Deductible Days in Current Cycle
                                                                                (Remaining 4 days spill to Oct Cycle)
```

---

## Technical Mechanics

### 1. Mid-Cycle Contract Revision Proration
When an employee transitions compensation or job level mid-month, neither wage is discarded or retroactively overwritten:
1. **Time Slicing:** The pay cycle interval $[T_{start}, T_{end}]$ is partitioned into continuous, non-overlapping slices matching active contract dates.
2. **Slice 1 (Terminates Sep 14):**
   $$\text{Active Days} = 14$$
   $$\text{Proration Factor} = \frac{14}{30} \approx 0.4667$$
3. **Slice 2 (Effective Sep 15):**
   $$\text{Active Days} = 16$$
   $$\text{Proration Factor} = \frac{16}{30} \approx 0.5333$$
4. **Weighted Base Computation:**
   $$\text{Base Wage Total} = (W_1 \times 0.4667) + (W_2 \times 0.5333)$$

### 2. Multi-Period Leave Boundary Clipping
When an employee requests leave spanning across cycle boundaries (e.g., September 28 to October 04, totaling 7 calendar days), the payroll engine applies set-theoretic intersection clipping using SQL `LEAST` and `GREATEST` functions:

```sql
SELECT
    request_id,
    employee_id,
    GREATEST(start_date, :period_start) AS clipped_start,
    LEAST(end_date, :period_end) AS clipped_end,
    (LEAST(end_date, :period_end) - GREATEST(start_date, :period_start) + 1) AS deductible_days_current_cycle
FROM leave_requests
WHERE employee_id = :employee_id
  AND status = 'APPROVED'
  AND daterange(start_date, end_date, '[]') && daterange(:period_start, :period_end, '[]');
```

* **Current Cycle Deduction:** Days falling within $[Sep\ 28, Sep\ 30]$ (3 days) are debited immediately against the September payroll run.
* **Subsequent Cycle Carryover:** Days falling within $[Oct\ 01, Oct\ 04]$ (4 days) are automatically captured when the October pay cycle executes its clipping window, preventing duplicate or skipped deductions.
