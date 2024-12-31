import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
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

    const now = new Date().toISOString();

    // First try to get a key with matching HWID
    const { data: hwidKey, error: hwidError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', getHWID())
      .eq('is_valid', true)
      .gte('expires_at', now)
      .maybeSingle();

    if (!hwidError && hwidKey) {
      return hwidKey;
    }

    // Then try to get a key with empty HWID
    const { data: emptyHwidKey, error: emptyError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', '')
      .eq('is_valid', true)
      .gte('expires_at', now)
      .maybeSingle();

    if (!emptyError && emptyHwidKey) {
      // Update the HWID
      const { error: updateError } = await supabase
        .from('keys')
        .update({ hwid: getHWID() })
        .eq('id', emptyHwidKey.id);

      if (!updateError) {
        return { ...emptyHwidKey, hwid: getHWID() };
      }
    }

    return null;
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