import { CheckpointStatus } from '../types';

const DEFAULT_CHECKPOINTS: CheckpointStatus = {
  checkpoint1: false,
  checkpoint2: false,
  checkpoint3: false,
};

// Debug function to log checkpoint operations
const logCheckpointOperation = (operation: string, data: any) => {
  console.log(`[Checkpoint ${operation}]:`, data);
};

export const resetCheckpoints = (): void => {
  logCheckpointOperation('reset', 'Resetting all checkpoints');
  localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
  window.dispatchEvent(new Event('checkpointsUpdated'));
};

export const getCheckpoints = (): CheckpointStatus => {
  const savedCheckpoints = localStorage.getItem('checkpoints');
  if (!savedCheckpoints) {
    logCheckpointOperation('init', 'Initializing default checkpoints');
    localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
    return DEFAULT_CHECKPOINTS;
  }
  const parsedCheckpoints = JSON.parse(savedCheckpoints);
  logCheckpointOperation('get', parsedCheckpoints);
  return parsedCheckpoints;
};

export const completeCheckpoint = (checkpointNumber: number): void => {
  logCheckpointOperation('complete-start', { checkpointNumber });
  
  const currentCheckpoints = getCheckpoints();
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
    (checkpointNumber === 3 && currentCheckpoints.checkpoint1 && currentCheckpoints.checkpoint2);

  if (!canComplete) {
    logCheckpointOperation('error', 'Cannot complete checkpoint - prerequisites not met');
    return;
  }

  const updatedCheckpoints = {
    ...currentCheckpoints,
    [checkpointKey]: true
  };
  
  try {
    localStorage.setItem('checkpoints', JSON.stringify(updatedCheckpoints));
    logCheckpointOperation('complete-success', updatedCheckpoints);
    window.dispatchEvent(new Event('checkpointsUpdated'));
  } catch (error) {
    logCheckpointOperation('error', error);
  }
};