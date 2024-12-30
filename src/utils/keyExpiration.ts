import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();
  const now = new Date().toISOString();

  try {
    // Get all expired keys for this HWID
    const { data: keys, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .lt('expires_at', now);

    if (error) throw error;

    // Handle expired keys
    if (keys && keys.length > 0) {
      // Reset local checkpoints
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');

      // Delete expired keys directly from Supabase
      const { error: deleteError } = await supabase
        .from('keys')
        .delete()
        .in('id', keys.map(key => key.id));

      if (deleteError) {
        console.error('Error deleting expired keys:', deleteError);
        return false;
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    return false;
  }
};