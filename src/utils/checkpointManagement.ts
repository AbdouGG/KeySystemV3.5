import { CheckpointStatus } from '../types';
import { supabase } from '../config/supabase';
import { getHWID } from './hwid';

const DEFAULT_CHECKPOINTS: CheckpointStatus = {
  checkpoint1: false,
  checkpoint2: false,
  checkpoint3: false,
};

export const resetCheckpoints = (): void => {
  localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
  window.dispatchEvent(new Event('checkpointsUpdated'));
};

export const getCheckpoints = (): CheckpointStatus => {
  const savedCheckpoints = localStorage.getItem('checkpoints');
  if (!savedCheckpoints) {
    localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
    return DEFAULT_CHECKPOINTS;
  }
  return JSON.parse(savedCheckpoints);
};

export const completeCheckpoint = (checkpointNumber: number): void => {
  const currentCheckpoints = getCheckpoints();
  const checkpointKey = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;

  // Validate checkpoint number
  if (![1, 2, 3].includes(checkpointNumber)) {
    console.error('Invalid checkpoint number');
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
    console.error('Cannot complete checkpoint - prerequisites not met');
    return;
  }

  const updatedCheckpoints = {
    ...currentCheckpoints,
    [checkpointKey]: true,
  };

  try {
    localStorage.setItem('checkpoints', JSON.stringify(updatedCheckpoints));
    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    console.error('Error completing checkpoint:', error);
  }
};