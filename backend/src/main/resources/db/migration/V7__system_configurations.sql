-- Migration V7: System Configurations Table
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    data_type VARCHAR(20) NOT NULL DEFAULT 'STRING',
    description TEXT,
    is_editable BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_system_configs_category ON system_configs(category);
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);

-- Seed Initial System Configurations
INSERT INTO system_configs (config_key, config_value, category, data_type, description, is_editable)
VALUES
    -- COMPANY
    ('company.name', 'PeoplePay360 Inc.', 'COMPANY', 'STRING', 'Legal enterprise organization name', true),
    ('company.email', 'hr@peoplepay360.com', 'COMPANY', 'STRING', 'Official corporate HR support email', true),
    ('company.currency', '₹', 'COMPANY', 'STRING', 'Primary currency symbol used across payroll calculations', true),
    ('company.tax_id', 'PAN-AAACP3600K', 'COMPANY', 'STRING', 'Enterprise Tax Registration / PAN Number', true),
    ('company.country', 'India', 'COMPANY', 'STRING', 'Headquarters operating country jurisdiction', true),
    
    -- PAYROLL
    ('payroll.payrun_cycle', 'MONTHLY', 'PAYROLL', 'STRING', 'Default salary payment frequency (MONTHLY, BI_WEEKLY, WEEKLY)', true),
    ('payroll.standard_working_days', '22', 'PAYROLL', 'NUMBER', 'Standard working days per month for proration', true),
    ('payroll.standard_hours_per_day', '8.0', 'PAYROLL', 'NUMBER', 'Standard working hours in a normal workday', true),
    ('payroll.pf_percentage', '12.0', 'PAYROLL', 'NUMBER', 'Employee Provident Fund (PF) contribution percentage', true),
    ('payroll.esi_percentage', '0.75', 'PAYROLL', 'NUMBER', 'Employee State Insurance (ESI) contribution percentage', true),
    ('payroll.overtime_rate_multiplier', '1.5', 'PAYROLL', 'NUMBER', 'Overtime wage multiplier per extra hour worked', true),
    ('payroll.late_deduction_rate_per_hour', '0.5', 'PAYROLL', 'NUMBER', 'Fraction of hourly wage deducted per 30 minutes unapproved delay', true),
    
    -- ATTENDANCE
    ('attendance.grace_period_minutes', '15', 'ATTENDANCE', 'NUMBER', 'Grace period allowance in minutes before shift arrival is marked late', true),
    ('attendance.overtime_threshold_minutes', '30', 'ATTENDANCE', 'NUMBER', 'Minimum extra minutes beyond shift before overtime accrual begins', true),
    ('attendance.allow_manual_override', 'true', 'ATTENDANCE', 'BOOLEAN', 'Allow managers to manually override employee check-in/out timestamps', true),
    ('attendance.auto_checkout_time', '23:59', 'ATTENDANCE', 'STRING', 'Default automatic check-out time for unclosed shifts', true),
    
    -- TIMEOFF
    ('timeoff.max_carry_forward_days', '5.0', 'TIMEOFF', 'NUMBER', 'Maximum annual unused leave carry-forward limit per employee', true),
    ('timeoff.max_negative_balance', '0.0', 'TIMEOFF', 'NUMBER', 'Maximum allowable negative leave allocation balance', true),
    ('timeoff.probation_restriction_days', '90', 'TIMEOFF', 'NUMBER', 'Probationary period length during which paid leave is restricted', true),
    ('timeoff.require_manager_approval', 'true', 'TIMEOFF', 'BOOLEAN', 'Mandate explicit manager approval before leave allocation debit', true),
    
    -- SYSTEM
    ('system.email_notifications', 'true', 'SYSTEM', 'BOOLEAN', 'Global toggle for automated email dispatch on payrun and leave events', true),
    ('system.session_timeout_minutes', '60', 'SYSTEM', 'NUMBER', 'Inactivity threshold in minutes before JWT session invalidation', true),
    ('system.audit_logging', 'true', 'SYSTEM', 'BOOLEAN', 'Record user action audit logs for administrative write operations', true)
ON CONFLICT (config_key) DO NOTHING;
