-- ============================================================================
-- V6: PostgreSQL Materialized Views for High-Volume Enterprise Dashboard Analytics
-- Pre-aggregates payroll costs & monthly trends for sub-10ms query performance
-- ============================================================================

-- 1. Create Materialized View for Department Cost Breakdown
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_department_payroll_cost AS
SELECT 
    COALESCE(c.department, e.department, 'Unassigned') AS department,
    COUNT(DISTINCT p.employee_id) AS headcount,
    COALESCE(SUM(p.gross_salary), 0) AS total_gross,
    COALESCE(SUM(p.net_salary), 0) AS total_net
FROM payslips p
JOIN contracts c ON p.contract_id = c.id
JOIN employees e ON p.employee_id = e.id
WHERE p.status IN ('VALIDATED', 'PAID')
GROUP BY COALESCE(c.department, e.department, 'Unassigned');

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dept_cost_dept ON mv_department_payroll_cost (department);

-- 2. Create Materialized View for Monthly Payroll Trends
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_payroll_summary AS
SELECT 
    p.period_start AS period_start,
    COUNT(p.id) AS payslip_count,
    COALESCE(SUM(p.gross_salary), 0) AS total_gross,
    COALESCE(SUM(p.net_salary), 0) AS total_net
FROM payslips p
WHERE p.status IN ('VALIDATED', 'PAID')
GROUP BY p.period_start;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_summary_period ON mv_monthly_payroll_summary (period_start);
