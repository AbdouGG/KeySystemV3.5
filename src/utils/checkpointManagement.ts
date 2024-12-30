import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import type { CheckpointStatus } from '../types';

const DEFAULT_CHECKPOINTS: CheckpointStatus = {
  checkpoint1: false,
  checkpoint2: false,
  checkpoint3: false,
};

// Debug function to log checkpoint operations
const logCheckpointOperation = (operation: string, data: any) => {
  console.log(`[Checkpoint ${operation}]:`, data);
};

export const resetCheckpoints = async (): Promise<void> => {
  const hwid = getHWID();
  logCheckpointOperation('reset', 'Resetting all checkpoints');
  
  try {
    // Update or insert checkpoint progress in Supabase
    const { error } = await supabase
      .from('checkpoint_progress')
      .upsert({
        hwid,
        checkpoint1: false,
        checkpoint2: false,
        checkpoint3: false,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update localStorage to match
    localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    console.error('Error resetting checkpoints:', error);
    // Fallback to localStorage only if Supabase fails
    localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
    window.dispatchEvent(new Event('checkpointsUpdated'));
  }
};

export const getCheckpoints = async (): Promise<CheckpointStatus> => {
  const hwid = getHWID();
  
  try {
    // Try to get checkpoints from Supabase first
    const { data, error } = await supabase
      .from('checkpoint_progress')
      .select('*')
      .eq('hwid', hwid)
      .single();

    if (error) {
      // If no record exists, create one
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('checkpoint_progress')
          .insert([{ hwid, ...DEFAULT_CHECKPOINTS }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }
      throw error;
    }

    // Update localStorage to match Supabase
    const checkpoints: CheckpointStatus = {
      checkpoint1: data.checkpoint1,
      checkpoint2: data.checkpoint2,
      checkpoint3: data.checkpoint3
    };
    localStorage.setItem('checkpoints', JSON.stringify(checkpoints));
    return checkpoints;
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    // Fallback to localStorage if Supabase fails
    const savedCheckpoints = localStorage.getItem('checkpoints');
    if (!savedCheckpoints) {
      localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
      return DEFAULT_CHECKPOINTS;
    }
    return JSON.parse(savedCheckpoints);
  }
};

export const completeCheckpoint = async (checkpointNumber: number): Promise<void> => {
  const hwid = getHWID();
  logCheckpointOperation('complete-start', { checkpointNumber });

  try {
    const currentCheckpoints = await getCheckpoints();
    const checkpointKey = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;

    // Validate checkpoint number
    if (![1, 2, 3].includes(checkpointNumber)) {
      logCheckpointOperation('error', 'Invalid checkpoint number');
      return;
    }

    // Check completion conditions
    const canComplete =
      checkpointNumber === 1 ||
      (checkpointNumber === 2 && currentCheckpoints.checkpoint1) ||
      (checkpointNumber === 3 &&
        currentCheckpoints.checkpoint1 &&
        currentCheckpoints.checkpoint2);

    if (!canComplete) {
      logCheckpointOperation('error', 'Cannot complete checkpoint - prerequisites not met');
      return;
    }

    const updatedCheckpoints = {
      ...currentCheckpoints,
      [checkpointKey]: true,
    };

    // Update Supabase
    const { error } = await supabase
      .from('checkpoint_progress')
      .upsert({
        hwid,
        ...updatedCheckpoints,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Update localStorage
    localStorage.setItem('checkpoints', JSON.stringify(updatedCheckpoints));
    logCheckpointOperation('complete-success', updatedCheckpoints);
    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    logCheckpointOperation('error', error);
  }
};