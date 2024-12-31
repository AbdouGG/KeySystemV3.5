-- Add user_id column to keys table
ALTER TABLE keys ADD COLUMN IF NOT EXISTS user_id text;

-- Add user_id column to user_checkpoints table
ALTER TABLE user_checkpoints ADD COLUMN IF NOT EXISTS user_id text;

-- Add user_id column to verification_tokens table
ALTER TABLE verification_tokens ADD COLUMN IF NOT EXISTS user_id text;

-- Create indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_keys_user_id ON keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_checkpoints_user_id ON user_checkpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);