import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
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
      // If no valid key found, reset checkpoints
      resetCheckpoints();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching existing key:', error);
    // Reset checkpoints on error
    resetCheckpoints();
    return null;
  }
};

export const resetCheckpoints = () => {
  const defaultCheckpoints = {
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false,
  };
  localStorage.setItem('checkpoints', JSON.stringify(defaultCheckpoints));
};