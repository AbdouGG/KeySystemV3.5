import { supabase } from '../config/supabase';
import { resetCheckpoints } from './checkpointManagement';
import { getHWID } from './hwid';
import { deleteExpiredKey } from './keyDeletion';

export const checkKeyExpiration = async (): Promise<boolean> => {
  const hwid = getHWID();
  const now = new Date().toISOString();

  try {
    const { data: allKeys, error: keysError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .order('created_at', { ascending: false });

    if (keysError) throw keysError;

    // Find expired keys that are still marked as valid
    const expiredKeys = allKeys?.filter(key => 
      key.is_valid && new Date(key.expires_at) <= new Date()
    ) || [];

    // Handle expired keys
    if (expiredKeys.length > 0) {
      resetCheckpoints();
      localStorage.removeItem('had_valid_key');
      
      // Delete all expired keys
      for (const key of expiredKeys) {
        if (key.id) {
          await deleteExpiredKey(key.id);
        }
      }
      
      return true;
    }

    // Check for valid keys
    const validKey = allKeys?.find(key => 
      key.is_valid && new Date(key.expires_at) > new Date()
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