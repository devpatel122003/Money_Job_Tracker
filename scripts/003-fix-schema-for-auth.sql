-- Add authentication and fix date handling
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update students table to link with users
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE students ALTER COLUMN email DROP NOT NULL;

-- Add hourly rate support to income
ALTER TABLE income ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);
ALTER TABLE income ADD COLUMN IF NOT EXISTS hours_worked DECIMAL(10, 2);
ALTER TABLE income ADD COLUMN IF NOT EXISTS is_hourly BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_income_student_hourly ON income(student_id, is_hourly);
