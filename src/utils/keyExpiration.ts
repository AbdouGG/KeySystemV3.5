import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();
  const now = new Date().toISOString();

  try {
    // Check if the current key is expired
    const { data: keys, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .lt('expires_at', now);

    if (error) throw error;

    // If we found expired keys, reset local state
    if (keys && keys.length > 0) {
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    return false;
  }
};