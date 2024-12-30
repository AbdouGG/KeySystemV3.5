import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';
import { deleteExpiredKey } from './keyDeletion';
import { invalidateKey } from './keyInvalidation';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();
  const now = new Date().toISOString();

  try {
    // Get all valid keys for this HWID
    const { data: keys, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .lt('expires_at', now);

    if (error) throw error;

    // Handle expired keys
    if (keys && keys.length > 0) {
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');

      // Process each expired key
      for (const key of keys) {
        // First invalidate
        const invalidated = await invalidateKey(key.id);
        if (invalidated) {
          // Wait 2 seconds before deletion
          await new Promise(resolve => setTimeout(resolve, 2000));
          // Then delete
          await deleteExpiredKey(key.id);
        }
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    return false;
  }
};