/*
  # Update key generation to support empty HWID

  1. Changes
    - Remove unique index on hwid and is_valid to allow multiple empty HWIDs
    - Add check constraint to ensure HWID is either empty or valid
    - Add index for key lookups
*/

-- Drop the existing unique index
DROP INDEX IF EXISTS idx_unique_valid_key_per_hwid;

-- Add check constraint for HWID format
ALTER TABLE keys DROP CONSTRAINT IF EXISTS check_hwid_format;
ALTER TABLE keys ADD CONSTRAINT check_hwid_format 
  CHECK (hwid = '' OR hwid ~ '^[A-Za-z0-9\-]+$');

-- Add index for key lookups
CREATE INDEX IF NOT EXISTS idx_keys_key ON keys(key) WHERE is_valid = true;