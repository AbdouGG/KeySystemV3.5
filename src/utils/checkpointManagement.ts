import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import type { CheckpointStatus } from '../types';

export const resetCheckpoints = async (): Promise<void> => {
  const hwid = getHWID();

  try {
    await supabase.rpc('set_hwid', { hwid });

    // First, check if the user has any checkpoints
    const { data: existingCheckpoints } = await supabase
      .from('user_checkpoints')
      .select('*')
      .eq('hwid', hwid)
      .maybeSingle();

    if (existingCheckpoints) {
      // Update existing checkpoints
      const { error } = await supabase
        .from('user_checkpoints')
        .update({
          checkpoint1: false,
          checkpoint2: false,
          checkpoint3: false,
          last_verification: new Date().toISOString(),
        })
        .eq('hwid', hwid);

      if (error) throw error;
    } else {
      // Insert new checkpoints record
      const { error } = await supabase
        .from('user_checkpoints')
        .insert([
          {
            hwid,
            checkpoint1: false,
            checkpoint2: false,
            checkpoint3: false,
            last_verification: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
    }

    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    console.error('Error resetting checkpoints:', error);
  }
};

export const getCheckpoints = async (): Promise<CheckpointStatus> => {
  const hwid = getHWID();

  try {
    await supabase.rpc('set_hwid', { hwid });

    const { data, error } = await supabase
      .from('user_checkpoints')
      .select('*')
      .eq('hwid', hwid)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Create new checkpoints record
      const { error: insertError } = await supabase
        .from('user_checkpoints')
        .insert([
          {
            hwid,
            checkpoint1: false,
            checkpoint2: false,
            checkpoint3: false,
            last_verification: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      return {
        checkpoint1: false,
        checkpoint2: false,
        checkpoint3: false,
      };
    }

    return {
      checkpoint1: data.checkpoint1,
      checkpoint2: data.checkpoint2,
      checkpoint3: data.checkpoint3,
    };
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    return {
      checkpoint1: false,
      checkpoint2: false,
      checkpoint3: false,
    };
  }
};