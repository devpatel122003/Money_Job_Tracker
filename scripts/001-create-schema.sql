-- Students/Users table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position_title VARCHAR(255) NOT NULL,
  job_url TEXT,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  application_status VARCHAR(50) DEFAULT 'applied' CHECK (application_status IN ('saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'accepted', 'withdrawn')),
  application_date DATE NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income/Earnings table
CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  source VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  income_date DATE NOT NULL,
  category VARCHAR(100) DEFAULT 'job' CHECK (category IN ('job', 'internship', 'freelance', 'scholarship', 'allowance', 'other')),
  description TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL CHECK (category IN ('food', 'transportation', 'housing', 'education', 'entertainment', 'utilities', 'healthcare', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  merchant VARCHAR(255),
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget table
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  monthly_limit DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, category, start_date)
);

-- Email sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('email', 'manual')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'in_progress')),
  applications_updated INTEGER DEFAULT 0,
  sync_started_at TIMESTAMP NOT NULL,
  sync_completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application updates tracking (for email parsing)
CREATE TABLE IF NOT EXISTS application_updates (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  update_source VARCHAR(50) DEFAULT 'manual' CHECK (update_source IN ('manual', 'email', 'api')),
  email_subject TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_date ON job_applications(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_income_student_id ON income(student_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(income_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_student_id ON expenses(student_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_student_id ON sync_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at DESC);
