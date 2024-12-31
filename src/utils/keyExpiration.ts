import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();

  try {
    // Check for any keys associated with this HWID
    const { data: keys, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid);

    if (error) throw error;

    // Find any invalid or expired keys
    const now = new Date();
    const hasInvalidKey = keys?.some(key => 
      !key.is_valid || new Date(key.expires_at) < now
    );

    // Reset checkpoints if we found an invalid key
    if (hasInvalidKey) {
      await resetCheckpoints();
      localStorage.removeItem('had_valid_key');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking key validity:', error);
    return false;
  }
};