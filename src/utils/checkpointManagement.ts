import { CheckpointStatus } from '../types';

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
  
  // Only update if previous checkpoints are completed or it's the first checkpoint
  if (
    checkpointNumber === 1 ||
    (checkpointNumber === 2 && currentCheckpoints.checkpoint1) ||
    (checkpointNumber === 3 && currentCheckpoints.checkpoint1 && currentCheckpoints.checkpoint2)
  ) {
    const updatedCheckpoints = {
      ...currentCheckpoints,
      [checkpointKey]: true
    };
    
    localStorage.setItem('checkpoints', JSON.stringify(updatedCheckpoints));
    window.dispatchEvent(new Event('checkpointsUpdated'));
  }
};