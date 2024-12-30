import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import { resetCheckpoints } from './checkpointManagement';
import type { Key } from '../types';

export const getExistingValidKey = async (): Promise<Key | null> => {
  try {
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
      // Only reset checkpoints if there's a real error, not just no results
      if (error.code !== 'PGRST116') { // PGRST116 is the "no results" error code
        resetCheckpoints();
      }
      return null;
    }

    // Check if the key is expired
    if (new Date(data.expires_at) <= new Date()) {
      resetCheckpoints();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching existing key:', error);
    // Only reset checkpoints on actual errors
    if (error && (error as any).code !== 'PGRST116') {
      resetCheckpoints();
    }
    return null;
  }
};

// Add a function to check key validity periodically
export const startKeyValidityCheck = () => {
  const checkKeyValidity = async () => {
    try {
      const hwid = getHWID();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('keys')
        .select('*')
        .eq('hwid', hwid)
        .eq('is_valid', true)
        .gte('expires_at', now);

      // Only reset if we had a valid key before and now it's invalid
      if ((error || !data || data.length === 0) && localStorage.getItem('had_valid_key') === 'true') {
        resetCheckpoints();
        localStorage.removeItem('had_valid_key');
      } else if (data && data.length > 0) {
        localStorage.setItem('had_valid_key', 'true');
      }
    } catch (error) {
      console.error('Error checking key validity:', error);
      // Only reset on actual errors if we had a valid key before
      if (localStorage.getItem('had_valid_key') === 'true') {
        resetCheckpoints();
        localStorage.removeItem('had_valid_key');
      }
    }
  };

  // Check every minute
  const intervalId = setInterval(checkKeyValidity, 60000);
  return () => clearInterval(intervalId);
};