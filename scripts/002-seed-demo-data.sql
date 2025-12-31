-- Insert a demo student
INSERT INTO students (email, name) VALUES 
  ('demo@student.edu', 'Demo Student')
ON CONFLICT (email) DO NOTHING;

-- Get the student ID for demo data
DO $$
DECLARE
  demo_student_id INTEGER;
BEGIN
  SELECT id INTO demo_student_id FROM students WHERE email = 'demo@student.edu';

  -- Insert sample job applications
  INSERT INTO job_applications (student_id, company_name, position_title, location, salary_range, application_status, application_date, notes) VALUES
    (demo_student_id, 'Google', 'Software Engineering Intern', 'Mountain View, CA', '$8,000-$10,000/month', 'interview', CURRENT_DATE - INTERVAL '14 days', 'Technical interview scheduled for next week'),
    (demo_student_id, 'Microsoft', 'Program Manager Intern', 'Redmond, WA', '$7,500-$9,000/month', 'phone_screen', CURRENT_DATE - INTERVAL '7 days', 'Completed first round phone screen'),
    (demo_student_id, 'Amazon', 'SDE Intern', 'Seattle, WA', '$8,500-$10,000/month', 'applied', CURRENT_DATE - INTERVAL '21 days', 'Waiting to hear back'),
    (demo_student_id, 'Meta', 'Data Science Intern', 'Menlo Park, CA', '$9,000-$11,000/month', 'rejected', CURRENT_DATE - INTERVAL '30 days', 'Not selected to move forward'),
    (demo_student_id, 'Apple', 'iOS Engineering Intern', 'Cupertino, CA', '$8,000-$9,500/month', 'applied', CURRENT_DATE - INTERVAL '5 days', 'Just submitted application'),
    (demo_student_id, 'Startup XYZ', 'Full Stack Developer', 'Remote', '$60,000-$80,000/year', 'offer', CURRENT_DATE - INTERVAL '10 days', 'Received offer, considering options');

  -- Insert sample income
  INSERT INTO income (student_id, source, amount, income_date, category, description, is_recurring) VALUES
    (demo_student_id, 'Part-time Job - Campus Library', 1200.00, CURRENT_DATE - INTERVAL '30 days', 'job', 'Monthly salary', true),
    (demo_student_id, 'Freelance Web Project', 800.00, CURRENT_DATE - INTERVAL '15 days', 'freelance', 'Client website project', false),
    (demo_student_id, 'Academic Scholarship', 2500.00, CURRENT_DATE - INTERVAL '60 days', 'scholarship', 'Semester scholarship', false),
    (demo_student_id, 'Part-time Job - Campus Library', 1200.00, CURRENT_DATE - INTERVAL '60 days', 'job', 'Monthly salary', true);

  -- Insert sample expenses
  INSERT INTO expenses (student_id, category, amount, expense_date, description, merchant) VALUES
    (demo_student_id, 'food', 45.50, CURRENT_DATE - INTERVAL '1 days', 'Groceries', 'Whole Foods'),
    (demo_student_id, 'transportation', 120.00, CURRENT_DATE - INTERVAL '3 days', 'Monthly bus pass', 'Transit Authority'),
    (demo_student_id, 'food', 28.75, CURRENT_DATE - INTERVAL '5 days', 'Dinner with friends', 'Pizza Place'),
    (demo_student_id, 'education', 89.99, CURRENT_DATE - INTERVAL '7 days', 'Textbook', 'Amazon'),
    (demo_student_id, 'entertainment', 15.00, CURRENT_DATE - INTERVAL '10 days', 'Movie tickets', 'Cinema'),
    (demo_student_id, 'housing', 850.00, CURRENT_DATE - INTERVAL '30 days', 'Monthly rent', 'Landlord'),
    (demo_student_id, 'utilities', 65.00, CURRENT_DATE - INTERVAL '30 days', 'Electricity and internet', 'Utility Company'),
    (demo_student_id, 'food', 220.00, CURRENT_DATE - INTERVAL '30 days', 'Monthly groceries', 'Various'),
    (demo_student_id, 'transportation', 45.00, CURRENT_DATE - INTERVAL '12 days', 'Ride share', 'Uber');

  -- Insert sample budgets
  INSERT INTO budgets (student_id, category, monthly_limit, start_date) VALUES
    (demo_student_id, 'food', 400.00, DATE_TRUNC('month', CURRENT_DATE)),
    (demo_student_id, 'transportation', 150.00, DATE_TRUNC('month', CURRENT_DATE)),
    (demo_student_id, 'entertainment', 100.00, DATE_TRUNC('month', CURRENT_DATE)),
    (demo_student_id, 'shopping', 200.00, DATE_TRUNC('month', CURRENT_DATE));

END $$;
