-- ============================================================================
-- V8: Schema Corrections, Security Hardening & View Fixes
-- ============================================================================

-- 1. Add validated_at column that the Payrun entity declares but V3 omits.
ALTER TABLE payruns ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

-- 2. Fix the immutability trigger: replace the ghost 'finalized' (lowercase)
--    value with the actual COMPUTED status so recompute is blocked on paid payslips.
CREATE OR REPLACE FUNCTION trg_lock_finalized_payslip()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('PAID', 'VALIDATED') THEN
        RAISE EXCEPTION 'ImmutableRecordError: Finalized or paid payslips cannot be modified or deleted.';
    END IF;
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Harden RLS default-deny: flip the helper so an unset/empty session variable
--    returns FALSE (deny) rather than TRUE (allow all). HR/Admin roles are whitelisted.
CREATE OR REPLACE FUNCTION is_hr_or_admin_role() RETURNS BOOLEAN AS $$
DECLARE
    role_str TEXT;
BEGIN
    role_str := NULLIF(current_setting('app.current_user_role', true), '');
    -- Only grant broad access to explicitly privileged roles.
    IF role_str IS NOT NULL AND role_str IN ('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER') THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
EXCEPTION WHEN OTHERS THEN
    -- On any error, deny rather than open.
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4. Fix view_payrun_summary: the fan-out JOIN on attendance_records caused
--    wrong AVG math. Compute per-employee worked hours in a subquery first.
CREATE OR REPLACE VIEW view_payrun_summary AS
WITH emp_hours AS (
    SELECT
        ar.employee_id,
        ar.date,
        COALESCE(ar.worked_hours, 0) AS worked_hours
    FROM attendance_records ar
)
SELECT
    pr.id                           AS payrun_id,
    pr.name                         AS payrun_name,
    pr.period_start,
    pr.period_end,
    d.name                          AS department_name,
    COUNT(ps.id)                    AS total_employees_paid,
    SUM(ps.gross_salary)            AS total_gross_cost,
    SUM(ps.total_deductions)        AS total_deductions_held,
    SUM(ps.net_salary)              AS total_net_disbursed,
    ROUND(
        AVG(
            (SELECT COALESCE(SUM(eh.worked_hours), 0)
             FROM emp_hours eh
             WHERE eh.employee_id = ps.employee_id
               AND eh.date BETWEEN pr.period_start AND pr.period_end)
        ), 2
    )                               AS avg_worked_hours
FROM payruns pr
JOIN payslips ps ON ps.payrun_id = pr.id
JOIN employees e ON e.id = ps.employee_id
LEFT JOIN departments d ON d.id = e.department_id
WHERE ps.status = 'PAID'
GROUP BY pr.id, pr.name, pr.period_start, pr.period_end, d.name;
