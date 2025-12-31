-- Drop the old students table and migrate to unified users table
-- Drop all foreign key constraints first
ALTER TABLE IF EXISTS job_applications DROP CONSTRAINT IF EXISTS job_applications_student_id_fkey;
ALTER TABLE IF EXISTS income DROP CONSTRAINT IF EXISTS income_student_id_fkey;
ALTER TABLE IF EXISTS expenses DROP CONSTRAINT IF EXISTS expenses_student_id_fkey;
ALTER TABLE IF EXISTS budgets DROP CONSTRAINT IF EXISTS budgets_student_id_fkey;
ALTER TABLE IF EXISTS sync_logs DROP CONSTRAINT IF EXISTS sync_logs_student_id_fkey;

-- Rename student_id columns to user_id
ALTER TABLE IF EXISTS job_applications RENAME COLUMN student_id TO user_id;
ALTER TABLE IF EXISTS income RENAME COLUMN student_id TO user_id;
ALTER TABLE IF EXISTS expenses RENAME COLUMN student_id TO user_id;
ALTER TABLE IF EXISTS budgets RENAME COLUMN student_id TO user_id;
ALTER TABLE IF EXISTS sync_logs RENAME COLUMN student_id TO user_id;

-- Drop old students table
DROP TABLE IF EXISTS students CASCADE;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints pointing to users table
ALTER TABLE job_applications 
  ADD CONSTRAINT job_applications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE income 
  ADD CONSTRAINT income_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE expenses 
  ADD CONSTRAINT expenses_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE budgets 
  ADD CONSTRAINT budgets_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sync_logs 
  ADD CONSTRAINT sync_logs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update indexes
DROP INDEX IF EXISTS idx_job_applications_student_id;
DROP INDEX IF EXISTS idx_income_student_id;
DROP INDEX IF EXISTS idx_expenses_student_id;
DROP INDEX IF EXISTS idx_sync_logs_student_id;

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON sync_logs(user_id);
