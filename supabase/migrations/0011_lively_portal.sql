/*
  # Fix delayed key deletion
  
  1. Changes
    - Creates a new column to track deletion time
    - Adds row-level trigger to mark keys for deletion
    - Creates function to handle actual deletion after delay
  
  2. Security
    - Maintains existing RLS policies
    - Functions execute with security definer
*/

-- Add column to track when key should be deleted
ALTER TABLE keys ADD COLUMN IF NOT EXISTS delete_at timestamptz;

-- Drop existing triggers
DROP TRIGGER IF EXISTS delete_expired_keys_trigger ON keys;
DROP TRIGGER IF EXISTS auto_delete_expired_key ON keys;

-- Create function to mark keys for deletion
CREATE OR REPLACE FUNCTION mark_key_for_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.is_valid = true THEN
    NEW.is_valid := false;
    NEW.delete_at := NOW() + INTERVAL '10 seconds';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to perform actual deletion
CREATE OR REPLACE FUNCTION perform_delayed_deletion()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM keys 
  WHERE delete_at IS NOT NULL 
    AND delete_at <= NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create row-level trigger for marking keys
CREATE TRIGGER mark_expired_key_for_deletion
  BEFORE UPDATE OR INSERT ON keys
  FOR EACH ROW
  EXECUTE FUNCTION mark_key_for_deletion();

-- Create statement-level trigger for deletion
CREATE TRIGGER perform_delayed_key_deletion
  AFTER UPDATE OR INSERT ON keys
  FOR EACH STATEMENT
  EXECUTE FUNCTION perform_delayed_deletion();

-- Function to manually clean expired keys
CREATE OR REPLACE FUNCTION clean_expired_keys()
RETURNS void AS $$
BEGIN
  UPDATE keys 
  SET is_valid = false,
      delete_at = NOW() + INTERVAL '10 seconds'
  WHERE expires_at < NOW() 
    AND is_valid = true;
    
  DELETE FROM keys 
  WHERE delete_at IS NOT NULL 
    AND delete_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;