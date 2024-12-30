import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import { resetCheckpoints, getCheckpoints } from './checkpointManagement';
import type { Key } from '../types';

// New function to handle checkpoint persistence
const handleCheckpointPersistence = async (hwid: string) => {
  try {
    const { data: persistedData } = await supabase
      .from('checkpoint_progress')
      .select('*')
      .eq('hwid', hwid)
      .single();

    if (persistedData) {
      // Restore checkpoints from database
      localStorage.setItem('checkpoints', JSON.stringify({
        checkpoint1: persistedData.checkpoint1,
        checkpoint2: persistedData.checkpoint2,
        checkpoint3: persistedData.checkpoint3
      }));
      window.dispatchEvent(new Event('checkpointsUpdated'));
    }
  } catch (error) {
    console.error('Error handling checkpoint persistence:', error);
  }
};

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
      if (error.code !== 'PGRST116') {
        await handleCheckpointPersistence(hwid);
      }
      return null;
    }

    if (new Date(data.expires_at) <= new Date()) {
      await handleCheckpointPersistence(hwid);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching existing key:', error);
    return null;
  }
};

export const startKeyValidityCheck = () => {
  const checkKeyValidity = async () => {
    try {
      const hwid = getHWID();
      const now = new Date().toISOString();
      const currentCheckpoints = getCheckpoints();

      // Persist current checkpoints
      await supabase
        .from('checkpoint_progress')
        .upsert({
          hwid,
          checkpoint1: currentCheckpoints.checkpoint1,
          checkpoint2: currentCheckpoints.checkpoint2,
          checkpoint3: currentCheckpoints.checkpoint3,
          updated_at: now
        }, {
          onConflict: 'hwid'
        });

      const { data, error } = await supabase
        .from('keys')
        .select('*')
        .eq('hwid', hwid)
        .eq('is_valid', true)
        .gte('expires_at', now);

      if (error || !data || data.length === 0) {
        await handleCheckpointPersistence(hwid);
      }
    } catch (error) {
      console.error('Error checking key validity:', error);
    }
  };

  const intervalId = setInterval(checkKeyValidity, 60000);
  return () => clearInterval(intervalId);
};