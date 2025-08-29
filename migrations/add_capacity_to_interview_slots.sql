-- Migration: Add capacity fields to interview_slots table
-- Date: 2025-08-29
-- Purpose: Allow multiple interview candidates per time slot

-- Step 1: Add new columns for capacity management
ALTER TABLE interview_slots 
ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 1 CHECK (max_capacity >= 1),
ADD COLUMN IF NOT EXISTS current_capacity INTEGER DEFAULT 0 CHECK (current_capacity >= 0);

-- Step 2: Migrate existing data
-- Set current_capacity to 1 for slots that have confirmed schedules
UPDATE interview_slots
SET current_capacity = 1
WHERE id IN (
    SELECT DISTINCT interview_slot_id 
    FROM interview_schedules 
    WHERE status = 'confirmed'
);

-- Step 3: Add constraint to ensure current_capacity never exceeds max_capacity
ALTER TABLE interview_slots
ADD CONSTRAINT check_capacity CHECK (current_capacity <= max_capacity);

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_slots_capacity 
ON interview_slots(company_id, start_time, current_capacity, max_capacity);

-- Verify the changes
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'interview_slots'
ORDER BY ordinal_position;