-- ============================================================================
-- V2: Operational Schema (Contracts with GiST Exclusion, Attendance, Leaves)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(50) NOT NULL UNIQUE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    department VARCHAR(100) NOT NULL,
    job_position VARCHAR(100) NOT NULL,
    salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE RESTRICT,
    working_schedule_id UUID NOT NULL REFERENCES working_schedules(id) ON DELETE RESTRICT,
    wage NUMERIC(12, 2) NOT NULL CHECK (wage >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_contract_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT exclude_contract_overlap EXCLUDE USING gist (
        employee_id WITH =,
        daterange(start_date, COALESCE(end_date, 'infinity'::date), '[]') WITH &&
    ) WHERE (status = 'RUNNING')
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    worked_hours NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    expected_hours NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason TEXT,
    reviewed_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_attendance_emp_date UNIQUE (employee_id, date)
);

CREATE TABLE IF NOT EXISTS time_off_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(10) NOT NULL DEFAULT 'DAYS',
    requires_allocation BOOLEAN NOT NULL DEFAULT TRUE,
    payroll_affecting BOOLEAN NOT NULL DEFAULT FALSE,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS time_off_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    time_off_type_id UUID NOT NULL REFERENCES time_off_types(id) ON DELETE RESTRICT,
    allocated_days NUMERIC(5, 2) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approval_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    time_off_type_id UUID NOT NULL REFERENCES time_off_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    requested_units NUMERIC(5, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRM',
    reason TEXT,
    approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approval_date TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT exclude_approved_leave_overlap EXCLUDE USING gist (
        employee_id WITH =,
        daterange(start_date, end_date, '[]') WITH &&
    ) WHERE (status = 'APPROVED')
);
