import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import type { CheckpointStatus } from '../types';

export const resetCheckpoints = async (): Promise<void> => {
  const hwid = getHWID();

  try {
    await supabase.rpc('set_hwid', { hwid });
    
    const { error } = await supabase
      .from('user_checkpoints')
      .upsert({
        hwid,
        checkpoint1: false,
        checkpoint2: false,
        checkpoint3: false,
        last_verification: new Date().toISOString()
      });

    if (error) throw error;
    
    // Dispatch event for UI updates
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No checkpoints found, create new entry
        await supabase
          .from('user_checkpoints')
          .insert([{
            hwid,
            checkpoint1: false,
            checkpoint2: false,
            checkpoint3: false,
            last_verification: new Date().toISOString()
          }]);
        
        return {
          checkpoint1: false,
          checkpoint2: false,
          checkpoint3: false
        };
      }
      throw error;
    }

    return {
      checkpoint1: data.checkpoint1,
      checkpoint2: data.checkpoint2,
      checkpoint3: data.checkpoint3
    };
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    return {
      checkpoint1: false,
      checkpoint2: false,
      checkpoint3: false
    };
  }
};

export const completeCheckpoint = async (checkpointNumber: number): Promise<void> => {
  const hwid = getHWID();

  try {
    await supabase.rpc('set_hwid', { hwid });

    // Verify prerequisites
    const currentCheckpoints = await getCheckpoints();
    const canComplete =
      checkpointNumber === 1 ||
      (checkpointNumber === 2 && currentCheckpoints.checkpoint1) ||
      (checkpointNumber === 3 &&
        currentCheckpoints.checkpoint1 &&
        currentCheckpoints.checkpoint2);

    if (!canComplete) {
      throw new Error('Prerequisites not met');
    }

    const checkpointKey = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;
    
    const { error } = await supabase
      .from('user_checkpoints')
      .upsert({
        hwid,
        [checkpointKey]: true,
        last_verification: new Date().toISOString()
      });

    if (error) throw error;

    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    console.error('Error completing checkpoint:', error);
    throw error;
  }
};