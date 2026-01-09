-- Migration: Add password_hash column to users table
-- This migration adds a password_hash column to properly store user passwords
-- instead of using the temporary hack of storing it in the name field

-- Add password_hash column
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255);

-- For existing users who signed up before this migration,
-- we need to handle their passwords. Since we can't recover plaintext passwords,
-- we'll set a temporary password hash that users will need to reset
-- In production, you would send a password reset email instead

-- Update existing users: if their name looks like a hash (64 hex chars),
-- move it to password_hash, otherwise set a default hash
UPDATE users
SET password_hash = CASE
    WHEN name ~ '^[a-f0-9]{64}$' THEN name  -- It's a SHA-256 hash
    ELSE '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'  -- "password" hash for reset
END
WHERE password_hash IS NULL;

-- Make the column NOT NULL after setting values
ALTER TABLE users
ALTER COLUMN password_hash SET NOT NULL;

-- Add comment
COMMENT ON COLUMN users.password_hash IS 'SHA-256 hash of user password for authentication';
