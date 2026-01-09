-- Migration: Add google_id column to users table
-- This adds support for Google OAuth authentication

-- Add google_id column (nullable for existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id);

-- Make password_hash nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
