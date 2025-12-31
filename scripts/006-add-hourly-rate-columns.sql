-- Add hourly rate columns to income table for hourly jobs
ALTER TABLE income ADD COLUMN IF NOT EXISTS is_hourly BOOLEAN DEFAULT FALSE;
ALTER TABLE income ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);
ALTER TABLE income ADD COLUMN IF NOT EXISTS hours_worked DECIMAL(5, 2);
