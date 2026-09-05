# Integrated HR & Payroll Engine: Database & Backend Architectural Specification

## 1. Overview & System Mission

This specification defines the production-grade architecture for an integrated HR and Payroll platform built on **Java 21 / Spring Boot 3.x** and **PostgreSQL 16+**. 

The engine bridges day-to-day workforce operations and deterministic financial accounting. The **Employee** record serves as the central hub connecting time-bounded **Contracts**, shift-based **Working Schedules**, range-partitioned **Attendance Logs**, and quota-managed **Time Off**. During a **Payrun**, the system resolves mid-cycle promotions via date-slicing proration, clips cross-period leaves to payrun boundaries, evaluates dynamic **Salary Rules** in sequential order, and persists immutable **Payslips** sealed by database-level triggers.

```
OPERATIONAL DATA                   LEGAL / FINANCIAL CONTEXT
[Attendance Logs]                  [Active Contracts (Prorated)]
│                                      │
▼                                      ▼
[Leave Requests (Clipped)] ──────► [Sequential Salary Rules] ──────► [Immutable Payslip Ledger]
```

---

## 2. PostgreSQL DDL Schema & Storage Safeguards

### 2.1 Storage Extensions & Hard Invariants
PostgreSQL enforces zero-overlap integrity for contracts and approved leaves using GiST exclusion constraints. This eliminates concurrency bugs and race conditions before data hits the application layer.

```sql
-- Enable GiST indexing for scalar + temporal ranges
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Organization & Core Hub
CREATE TABLE departments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL
);

CREATE TABLE employees (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_code VARCHAR(32) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Working Schedules & Shifts
CREATE TABLE working_schedules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    standard_weekly_hours NUMERIC(5, 2) NOT NULL DEFAULT 40.00
);

CREATE TABLE schedule_shifts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES working_schedules(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Mon, 6 = Sun
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    unpaid_break_minutes INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_shift_times CHECK (end_time > start_time)
);

-- 3. Salary Structures & Rules
CREATE TABLE salary_structures (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL
);

CREATE TABLE salary_rules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    salary_structure_id BIGINT NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
    sequence INT NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(64) NOT NULL,
    category VARCHAR(16) NOT NULL CHECK (category IN ('earning', 'allowance', 'deduction', 'tax', 'net')),
    computation_type VARCHAR(16) NOT NULL CHECK (computation_type IN ('fixed', 'percentage', 'formula')),
    formula TEXT NOT NULL,
    CONSTRAINT uq_structure_rule_code UNIQUE (salary_structure_id, code)
);

-- 4. Contracts (Zero-Overlap Invariant via GiST)
CREATE TABLE contracts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    working_schedule_id BIGINT NOT NULL REFERENCES working_schedules(id) ON DELETE RESTRICT,
    salary_structure_id BIGINT NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
    base_wage NUMERIC(12, 4) NOT NULL CHECK (base_wage >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'terminated')),
    CONSTRAINT chk_contract_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT exclude_contract_overlap EXCLUDE USING gist (
        employee_id WITH =,
        daterange(start_date, COALESCE(end_date, 'infinity'::date), '[]') WITH &&
    ) WHERE (status = 'active')
);

-- 5. Range-Partitioned Attendance (High-Throughput Time Series)
CREATE TABLE attendance_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ NOT NULL,
    check_out TIMESTAMPTZ,
    actual_worked_hours NUMERIC(5, 2),
    overtime_hours NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(16) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'missing_punch', 'reviewed', 'disputed')),
    PRIMARY KEY (date, id)
) PARTITION BY RANGE (date);

-- Quarterly partitions (Sample: 2026)
CREATE TABLE attendance_records_2026_q3 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE attendance_records_2026_q4 PARTITION OF attendance_records
    FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

-- 6. Leave Management (Overlap-Checked)
CREATE TABLE leave_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(64) NOT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE leave_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    leave_type_id BIGINT NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT exclude_approved_leave_overlap EXCLUDE USING gist (
        employee_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    ) WHERE (status = 'approved')
);

-- 7. Settlement Ledger & Audit Snapping
CREATE TABLE payruns (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'closed')),
    idempotency_key UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payrun_period CHECK (period_end >= period_start)
);

CREATE TABLE payslips (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payrun_id BIGINT NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    contract_id BIGINT NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    gross_amount NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
    status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'finalized', 'cancelled')),
    pdf_storage_path TEXT,
    CONSTRAINT uq_payrun_employee_contract UNIQUE (payrun_id, employee_id, contract_id)
);

CREATE TABLE payslip_lines (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payslip_id BIGINT NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    sequence INT NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(64) NOT NULL,
    category VARCHAR(16) NOT NULL,
    rate NUMERIC(12, 4),
    amount NUMERIC(12, 4) NOT NULL,
    formula_snapshot TEXT NOT NULL
);
```

### 2.2 Database-Level Immutability Trigger

Once a payslip is marked `finalized`, PostgreSQL prevents any subsequent update or deletion.

```sql
CREATE OR REPLACE FUNCTION trg_lock_finalized_payslip()
RETURNS TRIGGER AS $$ 
BEGIN     
    IF OLD.status = 'finalized' THEN         
        RAISE EXCEPTION 'ImmutableRecordError: Finalized payslips cannot be modified or deleted.';     
    END IF;     
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_payslip_immutability
BEFORE UPDATE OR DELETE ON payslips
FOR EACH ROW EXECUTE FUNCTION trg_lock_finalized_payslip();

CREATE TRIGGER enforce_payslip_lines_immutability
BEFORE UPDATE OR DELETE ON payslip_lines
FOR EACH ROW EXECUTE FUNCTION trg_lock_finalized_payslip();
```

---

## 3. High-Performance Indexing Strategy

```sql
-- Fast index-only scans for contract proration lookups
CREATE INDEX idx_contracts_proration ON contracts (employee_id, start_date, end_date) 
INCLUDE (base_wage, working_schedule_id, salary_structure_id) 
WHERE status = 'active';

-- Aggregation index for period-level attendance
CREATE INDEX idx_attendance_period ON attendance_records (employee_id, date) 
INCLUDE (actual_worked_hours, overtime_hours, status, check_out);

-- Boundary-clipping index for active leaves
CREATE INDEX idx_leave_requests_window ON leave_requests (employee_id, start_date, end_date) 
INCLUDE (leave_type_id) 
WHERE status = 'approved';

-- Queue-worker index for concurrent batch calculation
CREATE INDEX idx_payslips_worker_queue ON payslips (payrun_id, status) 
INCLUDE (employee_id, contract_id);
```

---

## 4. Operational Math & Single-Pass Extraction CTE

### 4.1 Algebraic Formulations

* **Contract Proration Factor (Mid-Cycle Promotion):**

$$\text{Ratio} = \frac{\min(\text{Contract End}, \text{Period End}) - \max(\text{Contract Start}, \text{Period Start}) + 1}{\text{Period End} - \text{Period Start} + 1}$$

* **Leave Window Clipping (Cross-Month Leave):**

$$\text{Deductible Days} = \min(\text{Leave End}, \text{Period End}) - \max(\text{Leave Start}, \text{Period Start}) + 1$$

### 4.2 Unified Batch Extraction Query

Spring Boot executes this single native query to fetch pre-computed inputs for an entire payrun without hydrating thousands of JPA entities into memory.

```sql
WITH period_config AS (
    SELECT 
        CAST(:periodStart AS DATE) AS p_start,
        CAST(:periodEnd AS DATE) AS p_end,
        (CAST(:periodEnd AS DATE) - CAST(:periodStart AS DATE) + 1) AS period_days
),
contract_slices AS (
    SELECT 
        c.id AS contract_id,
        c.employee_id,
        c.base_wage,
        c.salary_structure_id,
        GREATEST(c.start_date, pc.p_start) AS slice_start,
        LEAST(COALESCE(c.end_date, pc.p_end), pc.p_end) AS slice_end,
        ROUND(
            (LEAST(COALESCE(c.end_date, pc.p_end), pc.p_end) - GREATEST(c.start_date, pc.p_start) + 1)::NUMERIC 
            / pc.period_days, 6
        ) AS proration_ratio
    FROM contracts c
    CROSS JOIN period_config pc
    WHERE c.status = 'active'
      AND c.start_date <= pc.p_end
      AND (c.end_date >= pc.p_start OR c.end_date IS NULL)
      AND (:departmentId IS NULL OR c.employee_id IN (
            SELECT id FROM employees WHERE department_id = :departmentId
      ))
),
slice_attendance AS (
    SELECT 
        cs.contract_id,
        COALESCE(SUM(ar.actual_worked_hours), 0.00) AS worked_hours,
        COALESCE(SUM(ar.overtime_hours), 0.00) AS overtime_hours,
        COUNT(*) FILTER (WHERE ar.check_out IS NULL OR ar.status = 'disputed') AS audit_flag_count
    FROM contract_slices cs
    LEFT JOIN attendance_records ar 
        ON ar.employee_id = cs.employee_id 
       AND ar.date BETWEEN cs.slice_start AND cs.slice_end
    GROUP BY cs.contract_id
),
slice_leaves AS (
    SELECT 
        cs.contract_id,
        COALESCE(SUM(
            LEAST(lr.end_date, cs.slice_end) - GREATEST(lr.start_date, cs.slice_start) + 1
        ) FILTER (WHERE lt.is_paid = TRUE), 0) AS paid_leave_days,
        COALESCE(SUM(
            LEAST(lr.end_date, cs.slice_end) - GREATEST(lr.start_date, cs.slice_start) + 1
        ) FILTER (WHERE lt.is_paid = FALSE), 0) AS unpaid_leave_days
    FROM contract_slices cs
    LEFT JOIN leave_requests lr 
        ON lr.employee_id = cs.employee_id 
       AND lr.status = 'approved'
       AND lr.start_date <= cs.slice_end 
       AND lr.end_date >= cs.slice_start
    LEFT JOIN leave_types lt ON lt.id = lr.leave_type_id
    GROUP BY cs.contract_id
)
SELECT 
    cs.contract_id AS contractId,
    cs.employee_id AS employeeId,
    cs.salary_structure_id AS salaryStructureId,
    cs.base_wage AS baseWage,
    cs.proration_ratio AS prorationRatio,
    (cs.base_wage * cs.proration_ratio) AS proratedBaseWage,
    sa.worked_hours AS workedHours,
    sa.overtime_hours AS overtimeHours,
    sa.audit_flag_count AS auditFlagCount,
    sl.paid_leave_days AS paidLeaveDays,
    sl.unpaid_leave_days AS unpaidLeaveDays,
    (sa.audit_flag_count > 0) AS requiresManualReview
FROM contract_slices cs
JOIN slice_attendance sa ON sa.contract_id = cs.contract_id
JOIN slice_leaves sl ON sl.contract_id = cs.contract_id;
```

---

## 5. Spring Boot (Java 21) Implementation Architecture

### 5.1 Native Projections Interface

```java
package com.enterprise.payroll.repository.projection;

import java.math.BigDecimal;

public interface PayrollInputEnvelope {
    Long getContractId();
    Long getEmployeeId();
    Long getSalaryStructureId();
    BigDecimal getBaseWage();
    BigDecimal getProrationRatio();
    BigDecimal getProratedBaseWage();
    BigDecimal getWorkedHours();
    BigDecimal getOvertimeHours();
    Integer getAuditFlagCount();
    Integer getPaidLeaveDays();
    Integer getUnpaidLeaveDays();
    Boolean getRequiresManualReview();
}
```

### 5.2 PostgreSQL Exception Translator (`23P01`)

Transforms database GiST exclusion rejections into HTTP 409 responses with clean domain messaging.

```java
package com.enterprise.payroll.web.advice;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;

@RestControllerAdvice
public class PayrollDatabaseExceptionTranslator {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        Throwable root = ex.getRootCause();
        if (root instanceof SQLException sqlEx) {
            // PostgreSQL SQLState 23P01 = exclusion_violation
            if ("23P01".equals(sqlEx.getSQLState())) {
                String message = sqlEx.getMessage();
                if (message.contains("exclude_contract_overlap")) {
                    return ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, 
                        "An active contract already exists for this employee within the specified date window."
                    );
                }
                if (message.contains("exclude_approved_leave_overlap")) {
                    return ProblemDetail.forStatusAndDetail(
                        HttpStatus.CONFLICT, 
                        "The requested time off overlaps with an already approved leave request."
                    );
                }
            }
        }
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Database constraint violation occurred.");
    }
}
```

### 5.3 Distributed Batch Worker Queue (`SKIP LOCKED` + Virtual Threads)

Coordinates parallel workers across instances without locking contention.

```java
package com.enterprise.payroll.service;

import com.enterprise.payroll.domain.Payslip;
import com.enterprise.payroll.domain.PayslipStatus;
import com.enterprise.payroll.repository.PayslipQueueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.Executors;

@Service
public class ConcurrentPayrollDispatcher {

    private final PayslipQueueRepository queueRepository;
    private final PayrollCalculatorEngine calculatorEngine;

    public ConcurrentPayrollDispatcher(PayslipQueueRepository queueRepo, PayrollCalculatorEngine engine) {
        this.queueRepository = queueRepo;
        this.calculatorEngine = engine;
    }

    public void processPayrunConcurrently(Long payrunId) {
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            while (true) {
                List<Payslip> batch = claimNextBatch(payrunId, 100);
                if (batch.isEmpty()) break;

                for (Payslip payslip : batch) {
                    executor.submit(() -> calculatorEngine.calculateAndPersist(payslip.getId()));
                }
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public List<Payslip> claimNextBatch(Long payrunId, int batchSize) {
        List<Payslip> claimed = queueRepository.claimBatchForProcessing(payrunId, batchSize);
        claimed.forEach(p -> p.setStatus(PayslipStatus.PROCESSING));
        return claimed;
    }
}
```

### 5.4 Sandboxed SpEL Rule Engine

Guarantees mathematical flexibility without exposing the JVM to code execution vulnerabilities.

```java
package com.enterprise.payroll.engine;

import com.enterprise.payroll.domain.SalaryRule;
import com.enterprise.payroll.repository.projection.PayrollInputEnvelope;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.SimpleEvaluationContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
public class SandboxedSalaryRuleEngine {

    private final SpelExpressionParser parser = new SpelExpressionParser();

    public Map<String, BigDecimal> executeRules(
        List<SalaryRule> rules, 
        PayrollInputEnvelope input
    ) {
        // Enforce safe data-binding evaluation: No classloaders, no arbitrary method execution
        Map<String, Object> contextVariables = new HashMap<>();
        contextVariables.put("BASIC", input.getProratedBaseWage());
        contextVariables.put("HOURS_WORKED", input.getWorkedHours());
        contextVariables.put("OT_HOURS", input.getOvertimeHours());
        contextVariables.put("UNPAID_DAYS", BigDecimal.valueOf(input.getUnpaidLeaveDays()));
        contextVariables.put("STANDARD_HOURS", new BigDecimal("160.00"));

        EvaluationContext context = SimpleEvaluationContext
            .forReadOnlyDataBinding()
            .build();

        Map<String, BigDecimal> computedLines = new LinkedHashMap<>();
        
        // Execute strictly by sequence
        for (SalaryRule rule : rules) {
            contextVariables.forEach(context::setVariable);

            Expression expression = parser.parseExpression(rule.getFormula());
            BigDecimal evaluatedAmount = expression.getValue(context, BigDecimal.class);
            
            evaluatedAmount = (evaluatedAmount == null) 
                ? BigDecimal.ZERO 
                : evaluatedAmount.setScale(4, RoundingMode.HALF_UP);

            computedLines.put(rule.getCode(), evaluatedAmount);
            contextVariables.put(rule.getCode(), evaluatedAmount);
        }

        return computedLines;
    }
}
```

---

## 6. Executive Reporting View

```sql
CREATE OR REPLACE VIEW view_payrun_summary AS
SELECT 
    pr.id AS payrun_id,
    pr.period_start,
    pr.period_end,
    d.name AS department_name,
    COUNT(ps.id) AS total_employees_paid,
    SUM(ps.gross_amount) AS total_gross_cost,
    SUM(ps.total_deductions) AS total_deductions_held,
    SUM(ps.net_amount) AS total_net_disbursed,
    ROUND(AVG(sa.total_overtime_hours), 2) AS avg_overtime_hours,
    SUM(sa.total_overtime_cost) AS total_overtime_cost,
    SUM(sl.total_unpaid_days) AS total_absentee_days
FROM payruns pr
JOIN payslips ps ON ps.payrun_id = pr.id
JOIN employees e ON e.id = ps.employee_id
JOIN departments d ON d.id = e.department_id
LEFT JOIN (
    SELECT 
        ar.employee_id,
        SUM(ar.overtime_hours) AS total_overtime_hours,
        SUM(ar.overtime_hours * 35.00) AS total_overtime_cost
    FROM attendance_records ar
    GROUP BY ar.employee_id
) sa ON sa.employee_id = e.id
LEFT JOIN (
    SELECT 
        lr.employee_id,
        SUM(lr.end_date - lr.start_date + 1) AS total_unpaid_days
    FROM leave_requests lr
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    WHERE lt.is_paid = FALSE AND lr.status = 'approved'
    GROUP BY lr.employee_id
) sl ON sl.employee_id = e.id
WHERE ps.status = 'finalized'
GROUP BY pr.id, pr.period_start, pr.period_end, d.name;
```

---

## 7. Production Edge-Case & Safeguard Matrix

| Operational Scenario | Anti-Pattern to Avoid | Production Standard Implemented |
| --- | --- | --- |
| **Overlapping Contracts** | Running a manual check (`SELECT count(*) > 0`) in the Spring service layer before inserting. | Enforce `EXCLUDE USING gist` on `daterange` in PostgreSQL; translate SQLState `23P01` in `@RestControllerAdvice`. |
| **Mid-Cycle Wage Revisions** | Overwriting base salary on the employee profile; recalculating whole month with new rate. | CTE date slicing via `GREATEST`/`LEAST` produces discrete `proration_ratio` envelopes per contract. |
| **Multi-Week Leaves** | Deducting full leave duration from the first pay period the leave touches. | SQL window-clipping via `GREATEST(lr.start_date, p_start)` and `LEAST(lr.end_date, p_end)`. |
| **Attendance Scalability** | Running full table scans on millions of daily punches across multiple years. | Declarative PostgreSQL **Range Partitioning** on `date` with quarterly table bounds. |
| **Worker Collisions** | Using unbounded pagination (`LIMIT`/`OFFSET`) or manual Redis distributed locks. | Use `FOR UPDATE SKIP LOCKED` batch consumer inside isolated transactions via Java 21 Virtual Threads. |
| **Formula Security** | Using `Eval.me()` or unconstrained `StandardEvaluationContext`. | Restrict execution to Spring's `SimpleEvaluationContext.forReadOnlyDataBinding()`. |
| **Audit Ledger Mutation** | Updating historical payslip values when employee metadata changes. | Database-level triggers block all `UPDATE`/`DELETE` operations on `finalized` payslips and lines. |
