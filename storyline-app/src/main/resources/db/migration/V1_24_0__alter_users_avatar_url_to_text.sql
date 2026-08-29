-- Alter avatar_url column to TEXT to accommodate long base64 image strings
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
