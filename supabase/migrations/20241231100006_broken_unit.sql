-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS trigger_check_expired_tokens ON verification_tokens;
DROP FUNCTION IF EXISTS check_expired_tokens();
DROP FUNCTION IF EXISTS cleanup_expired_verification_tokens();

-- Create the cleanup function
CREATE OR REPLACE FUNCTION delete_expired_tokens()
RETURNS void AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM verification_tokens
    WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  -- Log the deletion count
  RAISE NOTICE 'Deleted % expired verification tokens', deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger function
CREATE OR REPLACE FUNCTION check_and_delete_expired_tokens()
RETURNS trigger AS $$
BEGIN
  PERFORM delete_expired_tokens();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_delete_expired_tokens
  AFTER INSERT OR UPDATE
  ON verification_tokens
  FOR EACH STATEMENT
  EXECUTE FUNCTION check_and_delete_expired_tokens();

-- Make sure pg_cron extension exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup every minute
SELECT cron.schedule(
  'delete-expired-tokens',
  '* * * * *',
  $$SELECT delete_expired_tokens()$$
);

-- Run initial cleanup
SELECT delete_expired_tokens();