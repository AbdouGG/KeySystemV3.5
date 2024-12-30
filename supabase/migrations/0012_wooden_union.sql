/*
  # Reset checkpoints on key deletion
  
  1. Changes
    - Add function to reset checkpoints when keys are deleted
    - Update cleanup function to handle checkpoint reset
    - Maintain 10-second grace period
    
  2. Details
    - Resets checkpoint_progress when associated key is deleted
    - Maintains existing cleanup functionality
    - Includes error handling
*/

-- Drop existing cleanup function
DROP FUNCTION IF EXISTS cleanup_expired_keys();

-- Create new cleanup function that also handles checkpoint reset
CREATE OR REPLACE FUNCTION cleanup_expired_keys()
RETURNS void AS $$
DECLARE
  expired_hwids text[];
BEGIN
  -- First, get HWIDs of keys that will be deleted
  SELECT ARRAY_AGG(DISTINCT hwid)
  INTO expired_hwids
  FROM keys
  WHERE expires_at < (NOW() - INTERVAL '10 seconds');

  -- If we found expired keys, reset their checkpoints
  IF expired_hwids IS NOT NULL AND array_length(expired_hwids, 1) > 0 THEN
    -- Reset checkpoints for expired HWIDs
    UPDATE checkpoint_progress
    SET 
      checkpoint1 = false,
      checkpoint2 = false,
      checkpoint3 = false,
      updated_at = NOW()
    WHERE hwid = ANY(expired_hwids);
    
    -- Delete the expired keys
    DELETE FROM keys 
    WHERE expires_at < (NOW() - INTERVAL '10 seconds');
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error cleaning expired keys and resetting checkpoints: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Make sure pg_cron extension exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing job if it exists
SELECT cron.unschedule('cleanup-expired-keys');

-- Schedule the cleanup to run every minute
SELECT cron.schedule(
  'cleanup-expired-keys',
  '* * * * *',
  $$SELECT cleanup_expired_keys()$$
);