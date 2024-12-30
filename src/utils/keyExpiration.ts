import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .gte('expires_at', now)
      .single();

    // Only reset checkpoints if we had a valid key before and it's now expired
    if ((error || !data) && localStorage.getItem('had_valid_key') === 'true') {
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');
      return true;
    }

    // If we have a valid key, mark it
    if (data) {
      localStorage.setItem('had_valid_key', 'true');
    }

    return false;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    // Only reset if we had a valid key before
    if (localStorage.getItem('had_valid_key') === 'true') {
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');
    }
    return true;
  }
};