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

    if (error || !data) {
      resetCheckpoints();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    resetCheckpoints();
    return true;
  }
};