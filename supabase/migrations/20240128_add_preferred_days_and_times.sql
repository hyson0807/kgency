-- Add columns for preferred work days and times to user_info table
ALTER TABLE user_info
ADD COLUMN preferred_days text[] DEFAULT '{}',
ADD COLUMN preferred_times text[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN user_info.preferred_days IS 'Array of preferred work days (월, 화, 수, 목, 금, 토, 일)';
COMMENT ON COLUMN user_info.preferred_times IS 'Array of preferred time slots (오전, 오후, 저녁, 새벽)';