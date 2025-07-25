-- Update schema to add missing columns
USE users_db;

-- Add last_login column to users table
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER updated_at;

-- Verify the change
DESCRIBE users;
