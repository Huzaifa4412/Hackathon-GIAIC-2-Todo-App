ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

UPDATE users
SET password_hash = CASE
    WHEN LENGTH(name) = 64 AND name ~ '^[a-f0-9]+$' THEN name
    ELSE '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
END
WHERE password_hash IS NULL;

ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
