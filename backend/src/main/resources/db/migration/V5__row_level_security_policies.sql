-- ============================================================================
-- V5: Native PostgreSQL Row-Level Security (RLS) Policies
-- Enforces row-level isolation per employee and role at database engine level
-- ============================================================================

-- 1. Enable Row-Level Security on operational tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

-- 2. Create helper evaluation functions
CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_hr_or_admin_role() RETURNS BOOLEAN AS $$
DECLARE
    role_str TEXT;
BEGIN
    role_str := current_setting('app.current_user_role', true);
    IF role_str IS NULL OR role_str = '' OR role_str IN ('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER') THEN
        RETURN TRUE;
    END IF;
    RETURN FALSE;
EXCEPTION WHEN OTHERS THEN
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. RLS Policies for employees table
DROP POLICY IF EXISTS p_employees_rls ON employees;
CREATE POLICY p_employees_rls ON employees
    FOR ALL
    USING (
        is_hr_or_admin_role() 
        OR current_app_user_id() IS NULL 
        OR id = current_app_user_id()
    );

-- 4. RLS Policies for contracts table
DROP POLICY IF EXISTS p_contracts_rls ON contracts;
CREATE POLICY p_contracts_rls ON contracts
    FOR ALL
    USING (
        is_hr_or_admin_role() 
        OR current_app_user_id() IS NULL 
        OR employee_id = current_app_user_id()
    );

-- 5. RLS Policies for attendance_records table
DROP POLICY IF EXISTS p_attendance_rls ON attendance_records;
CREATE POLICY p_attendance_rls ON attendance_records
    FOR ALL
    USING (
        is_hr_or_admin_role() 
        OR current_app_user_id() IS NULL 
        OR employee_id = current_app_user_id()
    );

-- 6. RLS Policies for time_off_requests table
DROP POLICY IF EXISTS p_leave_requests_rls ON time_off_requests;
CREATE POLICY p_leave_requests_rls ON time_off_requests
    FOR ALL
    USING (
        is_hr_or_admin_role() 
        OR current_app_user_id() IS NULL 
        OR employee_id = current_app_user_id()
    );

-- 7. RLS Policies for time_off_allocations table
DROP POLICY IF EXISTS p_leave_allocations_rls ON time_off_allocations;
CREATE POLICY p_leave_allocations_rls ON time_off_allocations
    FOR ALL
    USING (
        is_hr_or_admin_role() 
        OR current_app_user_id() IS NULL 
        OR employee_id = current_app_user_id()
    );

-- 8. RLS Policies for payslips table
DROP POLICY IF EXISTS p_payslips_rls ON payslips;
CREATE POLICY p_payslips_rls ON payslips
    FOR ALL
    USING (
        is_hr_or_admin_role() 
        OR current_app_user_id() IS NULL 
        OR employee_id = current_app_user_id()
    );
