-- Fix missing columns for User Profile (address, emergency contact, employee_id)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address VARCHAR(500),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
