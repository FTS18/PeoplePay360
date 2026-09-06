-- ============================================================================
-- V4: Schema Alignment with Application JPA Entities
-- Drops NOT NULL constraints on legacy columns that are superseded by JPA mappings
-- ============================================================================

-- Working Schedule Lines: superseded by working_schedule_id
ALTER TABLE working_schedule_lines ALTER COLUMN schedule_id DROP NOT NULL;
ALTER TABLE working_schedule_lines ADD COLUMN IF NOT EXISTS working_schedule_id UUID REFERENCES working_schedules(id) ON DELETE CASCADE;
ALTER TABLE working_schedule_lines ADD COLUMN IF NOT EXISTS break_hours NUMERIC(4, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE working_schedule_lines ADD COLUMN IF NOT EXISTS work_hours NUMERIC(4, 2) NOT NULL DEFAULT 8.00;

-- Employees: align with Employee entity
ALTER TABLE employees ALTER COLUMN work_email DROP NOT NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS email VARCHAR(150) UNIQUE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_identifier_code VARCHAR(30);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS identification_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS joining_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Time Off Types: color and active flag
ALTER TABLE time_off_types ADD COLUMN IF NOT EXISTS color_code VARCHAR(10);
ALTER TABLE time_off_types ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Time Off Allocations: superseded by allocated_units
ALTER TABLE time_off_allocations ALTER COLUMN allocated_days DROP NOT NULL;
ALTER TABLE time_off_allocations ADD COLUMN IF NOT EXISTS allocated_units NUMERIC(5, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE time_off_allocations ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ;

-- Salary Structures: active flag
ALTER TABLE salary_structures ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

