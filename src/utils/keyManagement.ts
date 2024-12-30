import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import { resetCheckpoints } from './checkpointManagement';
import { checkKeyExpiration } from './keyExpiration';
import type { Key } from '../types';

export const getExistingValidKey = async (): Promise<Key | null> => {
  try {
    const isExpired = await checkKeyExpiration();
    if (isExpired) {
      return null;
    }

    const hwid = getHWID();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .gte('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Only reset if it's not a "no results" error
      if (error.code !== 'PGRST116') {
        resetCheckpoints();
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching existing key:', error);
    // Only reset on actual errors
    resetCheckpoints();
    return null;
  }
};

export const startKeyValidityCheck = () => {
  const checkKeyValidity = async () => {
    await checkKeyExpiration();
  };

  // Check every minute
  const intervalId = setInterval(checkKeyValidity, 60000);
  return () => clearInterval(intervalId);
};