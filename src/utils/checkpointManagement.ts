import { supabase } from '../config/supabase';
import { getUserId } from './userId';
import type { CheckpointStatus } from '../types';

export const resetCheckpoints = async (): Promise<void> => {
  const userId = await getUserId();

  try {
    const { data: existingCheckpoints } = await supabase
      .from('user_checkpoints')
      .select('*')
      .eq('user_id', userId)
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
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Insert new checkpoints record
      const { error } = await supabase
        .from('user_checkpoints')
        .insert([
          {
            user_id: userId,
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
  const userId = await getUserId();

  try {
    const { data, error } = await supabase
      .from('user_checkpoints')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Create new checkpoints record
      const { error: insertError } = await supabase
        .from('user_checkpoints')
        .insert([
          {
            user_id: userId,
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

export const completeCheckpoint = async (
  checkpointNumber: number,
  token: string
): Promise<void> => {
  const userId = await getUserId();

  try {
    // Verify token first
    const isValidToken = await verifyToken(token, checkpointNumber);
    if (!isValidToken) {
      throw new Error('Invalid or expired verification token');
    }

    // Get current checkpoints state
    const currentCheckpoints = await getCheckpoints();

    // Verify prerequisites
    if (
      (checkpointNumber === 2 && !currentCheckpoints.checkpoint1) ||
      (checkpointNumber === 3 &&
        (!currentCheckpoints.checkpoint1 || !currentCheckpoints.checkpoint2))
    ) {
      throw new Error('Previous checkpoints must be completed first');
    }

    const checkpointKey = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;

    const { error } = await supabase.from('user_checkpoints').upsert({
      user_id: userId,
      [checkpointKey]: true,
      last_verification: new Date().toISOString(),
    });

    if (error) throw error;

    // Verify the update was successful
    const updatedCheckpoints = await getCheckpoints();
    if (!updatedCheckpoints[checkpointKey]) {
      throw new Error('Failed to update checkpoint status');
    }

    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    console.error('Error completing checkpoint:', error);
    throw error;
  }
};