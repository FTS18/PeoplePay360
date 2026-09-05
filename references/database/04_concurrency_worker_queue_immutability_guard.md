# 4. Concurrency Worker Queue & Immutability Guard

To safely handle thousands of records simultaneously, batch workers claim rows without collision, calculate line items, and seal them with an immutability trigger.

---

## State Machine & Queue Architecture Diagram

```text
               ┌────────────────────────────────────────────────────────┐
               │                     PAYRUN OPENED                      │
               │     Generates `draft` payslip records for cycle        │
               └───────────────────────────┬────────────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         │                                                                   │
         ▼                                                                   ▼
┌─────────────────────────────────┐                         ┌─────────────────────────────────┐
│         WORKER NODE 1           │                         │         WORKER NODE 2           │
│ SELECT ... FOR UPDATE           │                         │ SELECT ... FOR UPDATE           │
│ SKIP LOCKED (Batch 1 - 100)     │                         │ SKIP LOCKED (Batch 101 - 200)   │
└────────────────┬────────────────┘                         └────────────────┬────────────────┘
                 │                                                           │
                 ▼                                                           ▼
┌─────────────────────────────────┐                         ┌─────────────────────────────────┐
│ State: 'processing'             │                         │ State: 'processing'             │
│ - Runs CTE Proration            │                         │ - Runs CTE Proration            │
│ - Aggregates Timesheets         │                         │ - Aggregates Timesheets         │
│ - Evaluates Rule Sequence       │                         │ - Evaluates Rule Sequence       │
└────────────────┬────────────────┘                         └────────────────┬────────────────┘
                 │                                                           │
                 └─────────────────────────────────┬─────────────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │       SNAPSHOT PERSISTENCE            │
                               │ - Insert rows into `payslip_lines`    │
                               │ - Set `payslips.status = 'finalized'` │
                               └───────────────────┬───────────────────┘
                                                   │
                                                   ▼
                               ┌───────────────────────────────────────┐
                               │      IMMUTABILITY TRIGGER FIRES       │
                               │  Blocks all UPDATE and DELETE events  │
                               │  Guarantees audit trail & PDF parity  │
                               └───────────────────────────────────────┘
```

---

## Technical Mechanics

### 1. High-Throughput Non-Blocking Row Claiming
When a Payrun is initialized, header rows are inserted with status `'draft'`. Parallel worker nodes claim disjoint subsets using PostgreSQL's row-level locking primitive:

```sql
BEGIN;

WITH claimed_batch AS (
    SELECT id
    FROM payslips
    WHERE payrun_id = :payrun_id
      AND status = 'draft'
    ORDER BY employee_id
    LIMIT 100
    FOR UPDATE SKIP LOCKED
)
UPDATE payslips
SET status = 'processing',
    updated_at = CURRENT_TIMESTAMP
FROM claimed_batch
WHERE payslips.id = claimed_batch.id
RETURNING payslips.id, payslips.employee_id, payslips.contract_id;
```

* **No Lock Contention:** `SKIP LOCKED` instructs the engine to bypass rows currently locked by another worker transaction rather than waiting or deadlocking.
* **Horizontal Scalability:** Multiple worker instances scale independently across CPU cores or nodes.

---

### 2. Processing Phase & Atomic Snapshot Persistence
For each claimed record:
1. Executes CTE date proration and historical contract slices.
2. Aggregates partitioned `attendance_records` and clips `leave_requests`.
3. Runs the sequenced salary rule evaluation chain.
4. Bulk inserts calculated line items into `payslip_lines`.
5. Updates `payslips.status` from `'processing'` to `'finalized'`:
   ```sql
   UPDATE payslips
   SET gross_salary = :computed_gross,
       total_deductions = :computed_deductions,
       net_salary = :computed_net,
       status = 'finalized',
       finalized_at = CURRENT_TIMESTAMP
   WHERE id = :payslip_id;
   
   COMMIT;
   ```

---

### 3. PostgreSQL Immutability Guard Trigger
To protect regulatory compliance, financial auditability, and PDF statement integrity, a PostgreSQL trigger defends finalized and paid records:

```sql
CREATE OR REPLACE FUNCTION trg_guard_finalized_payslip()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('finalized', 'paid') THEN
        IF TG_OP = 'DELETE' THEN
            RAISE EXCEPTION 'Hard delete prohibited on finalized payslip record (id: %)', OLD.id;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Allow transition from 'finalized' to 'paid' only; forbid modifying financial values
            IF OLD.status = 'finalized' AND NEW.status = 'paid' THEN
                IF (OLD.gross_salary != NEW.gross_salary OR 
                    OLD.total_deductions != NEW.total_deductions OR 
                    OLD.net_salary != NEW.net_salary) THEN
                    RAISE EXCEPTION 'Financial figures cannot be altered during status transitions on payslip (id: %)', OLD.id;
                END IF;
            ELSE
                RAISE EXCEPTION 'Finalized payslip record is immutable (id: %)', OLD.id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payslip_immutability_guard
BEFORE UPDATE OR DELETE ON payslips
FOR EACH ROW
EXECUTE FUNCTION trg_guard_finalized_payslip();
```
