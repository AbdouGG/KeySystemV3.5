import { supabase } from '../config/supabase';
import { getUserId } from './userId';
import { resetCheckpoints } from './checkpointManagement';
import { checkKeyExpiration } from './keyExpiration';
import { cleanExpiredKeys } from './keyCleanup';
import type { Key } from '../types';

export const getExistingValidKey = async (): Promise<Key | null> => {
  try {
    const isInvalid = await checkKeyExpiration();
    if (isInvalid) {
      return null;
    }

    const userId = await getUserId();
    const now = new Date().toISOString();

    // Get key for this user
    const { data: userKey, error } = await supabase
      .from('keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_valid', true)
      .gte('expires_at', now)
      .maybeSingle();

    if (error) {
      console.error('Error fetching key:', error);
      return null;
    }

    return userKey;
  } catch (error) {
    console.error('Error fetching existing key:', error);
    return null;
  }
};

export const startKeyValidityCheck = () => {
  const checkKeyValidity = async () => {
    await checkKeyExpiration();
    await cleanExpiredKeys();
  };

  // Initial check
  checkKeyValidity();

  // Check every minute
  const intervalId = setInterval(checkKeyValidity, 60000);
  return () => clearInterval(intervalId);
};