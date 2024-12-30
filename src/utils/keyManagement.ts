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
      // If no valid key exists, reset checkpoints
      resetCheckpoints();
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
    resetCheckpoints();
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

      if (error || !data || data.length === 0) {
        resetCheckpoints();
      }
    } catch (error) {
      console.error('Error checking key validity:', error);
      resetCheckpoints();
    }
  };

  // Check every minute
  const intervalId = setInterval(checkKeyValidity, 60000);
  return () => clearInterval(intervalId);
};