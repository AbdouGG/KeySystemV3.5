/*
  # Automatic Key Deletion System
  
  1. New Functions
    - `clean_expired_keys()`: Function to delete expired keys
    - `handle_expired_key()`: Trigger function to handle key expiration
    
  2. New Triggers
    - Trigger that runs on SELECT/UPDATE to automatically handle expired keys
*/

-- Function to clean expired keys
CREATE OR REPLACE FUNCTION clean_expired_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM keys 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger function to handle expired keys
CREATE OR REPLACE FUNCTION handle_expired_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() THEN
    DELETE FROM keys WHERE id = NEW.id;
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic deletion
CREATE TRIGGER auto_delete_expired_key
  BEFORE UPDATE OR SELECT ON keys
  FOR EACH ROW
  EXECUTE FUNCTION handle_expired_key();