/*
  # Add automatic key deletion trigger
  
  1. Changes
    - Creates a trigger function to handle expired keys
    - Adds trigger to automatically delete expired keys
    - Adds function to manually clean expired keys
  
  2. Security
    - No RLS changes needed
    - Functions execute with invoker's privileges
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS delete_expired_keys_trigger ON keys;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION delete_expired_keys_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM keys 
  WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER delete_expired_keys_trigger
  AFTER INSERT OR UPDATE ON keys
  FOR EACH STATEMENT
  EXECUTE FUNCTION delete_expired_keys_trigger_fn();

-- Function to manually clean expired keys
CREATE OR REPLACE FUNCTION clean_expired_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM keys 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;