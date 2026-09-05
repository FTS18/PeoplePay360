-- ============================================================================
-- V3: Payroll Settlement Ledger, Immutability Triggers & Performance Indexes
-- ============================================================================

CREATE TABLE IF NOT EXISTS payruns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_basic NUMERIC(14, 2) DEFAULT 0.00,
    total_allowances NUMERIC(14, 2) DEFAULT 0.00,
    total_deductions NUMERIC(14, 2) DEFAULT 0.00,
    total_net NUMERIC(14, 2) DEFAULT 0.00,
    payslips_count INT DEFAULT 0,
    paid_at TIMESTAMPTZ,
    idempotency_key UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_payrun_period CHECK (period_end >= period_start)
);

CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payrun_id UUID NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    worked_days INT NOT NULL DEFAULT 0,
    basic_wage NUMERIC(12, 2) NOT NULL,
    gross_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_allowances NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    pdf_generated BOOLEAN NOT NULL DEFAULT FALSE,
    pdf_storage_path TEXT,
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_payrun_employee_contract UNIQUE (payrun_id, employee_id, contract_id)
);

CREATE TABLE IF NOT EXISTS payslip_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payslip_id UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    rule_code VARCHAR(50) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    sequence INT NOT NULL,
    rate NUMERIC(5, 2),
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- Immutability Safeguard Trigger
CREATE OR REPLACE FUNCTION trg_lock_finalized_payslip()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('PAID', 'finalized', 'VALIDATED') THEN
        RAISE EXCEPTION 'ImmutableRecordError: Finalized or paid payslips cannot be modified or deleted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_payslip_immutability ON payslips;
CREATE TRIGGER enforce_payslip_immutability
BEFORE UPDATE OR DELETE ON payslips
FOR EACH ROW EXECUTE FUNCTION trg_lock_finalized_payslip();

DROP TRIGGER IF EXISTS enforce_payslip_lines_immutability ON payslip_lines;
CREATE TRIGGER enforce_payslip_lines_immutability
BEFORE UPDATE OR DELETE ON payslip_lines
FOR EACH ROW EXECUTE FUNCTION trg_lock_finalized_payslip();

-- Performance Indexing
CREATE INDEX IF NOT EXISTS idx_contracts_proration ON contracts (employee_id, start_date, end_date)
WHERE status = 'RUNNING';

CREATE INDEX IF NOT EXISTS idx_attendance_period ON attendance_records (employee_id, date);

CREATE INDEX IF NOT EXISTS idx_leave_requests_window ON time_off_requests (employee_id, start_date, end_date)
WHERE status = 'APPROVED';

CREATE INDEX IF NOT EXISTS idx_payslips_worker_queue ON payslips (payrun_id, status);

-- Executive Reporting Aggregation View
CREATE OR REPLACE VIEW view_payrun_summary AS
SELECT 
    pr.id AS payrun_id,
    pr.name AS payrun_name,
    pr.period_start,
    pr.period_end,
    d.name AS department_name,
    COUNT(ps.id) AS total_employees_paid,
    SUM(ps.gross_salary) AS total_gross_cost,
    SUM(ps.total_deductions) AS total_deductions_held,
    SUM(ps.net_salary) AS total_net_disbursed,
    ROUND(AVG(COALESCE(ar.worked_hours, 0)), 2) AS avg_worked_hours
FROM payruns pr
JOIN payslips ps ON ps.payrun_id = pr.id
JOIN employees e ON e.id = ps.employee_id
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN attendance_records ar ON ar.employee_id = e.id AND ar.date BETWEEN pr.period_start AND pr.period_end
WHERE ps.status = 'PAID'
GROUP BY pr.id, pr.name, pr.period_start, pr.period_end, d.name;
