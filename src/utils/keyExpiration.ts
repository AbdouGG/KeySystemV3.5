import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();
  const now = new Date().toISOString();

  try {
    // Get all keys for this HWID, ordered by creation date
    const { data: allKeys, error: keysError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .order('created_at', { ascending: false });

    if (keysError) throw keysError;

    // Find the most recent valid key
    const mostRecentValidKey = allKeys?.find(key => 
      key.is_valid && new Date(key.expires_at) > new Date()
    );

    // Find the most recent expired key
    const mostRecentExpiredKey = allKeys?.find(key =>
      key.is_valid && new Date(key.expires_at) <= new Date()
    );

    // If we have no valid key but we have an expired key, reset checkpoints
    if (!mostRecentValidKey && mostRecentExpiredKey) {
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');
      return true;
    }

    // If we have a valid key, mark it
    if (mostRecentValidKey) {
      localStorage.setItem('had_valid_key', 'true');
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    return false;
  }
};