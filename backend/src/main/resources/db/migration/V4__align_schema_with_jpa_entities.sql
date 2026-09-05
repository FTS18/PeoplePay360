-- ============================================================================
-- V4: Schema Alignment with Application JPA Entities
-- Drops NOT NULL constraints on legacy columns that are superseded by JPA mappings
-- ============================================================================

-- Working Schedule Lines: superseded by working_schedule_id
ALTER TABLE working_schedule_lines ALTER COLUMN schedule_id DROP NOT NULL;

-- Employees: superseded by email
ALTER TABLE employees ALTER COLUMN work_email DROP NOT NULL;

-- Time Off Allocations: superseded by allocated_units
ALTER TABLE time_off_allocations ALTER COLUMN allocated_days DROP NOT NULL;
