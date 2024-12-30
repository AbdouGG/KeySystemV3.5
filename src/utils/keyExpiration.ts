import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';
import { deleteExpiredKey } from './keyDeletion';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();

  try {
    const { data: allKeys, error: keysError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true);

    if (keysError) throw keysError;

    // Find expired keys
    const expiredKeys = allKeys?.filter(key => 
      new Date(key.expires_at) <= new Date()
    ) || [];

    // Handle expired keys
    if (expiredKeys.length > 0) {
      // Reset local state first
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');
      
      // Delete expired keys one by one
      for (const key of expiredKeys) {
        if (key.id) {
          await deleteExpiredKey(key.id);
        }
      }
      
      return true;
    }

    // Check for valid keys
    const validKey = allKeys?.find(key => 
      new Date(key.expires_at) > new Date()
    );

    if (validKey) {
      localStorage.setItem('had_valid_key', 'true');
    }

    return !validKey;
  } catch (error) {
    console.error('Error checking key expiration:', error);
    return false;
  }
};