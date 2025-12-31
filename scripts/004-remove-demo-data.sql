-- Remove all demo data
DELETE FROM sync_logs;
DELETE FROM budgets;
DELETE FROM expenses;
DELETE FROM income;
DELETE FROM job_applications;
DELETE FROM students WHERE email = 'demo@student.edu';
DELETE FROM users WHERE email = 'demo@student.edu';
