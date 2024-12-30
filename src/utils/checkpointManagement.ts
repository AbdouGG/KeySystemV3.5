import { CheckpointStatus } from '../types';

const DEFAULT_CHECKPOINTS: CheckpointStatus = {
  checkpoint1: false,
  checkpoint2: false,
  checkpoint3: false,
};

export const resetCheckpoints = (): void => {
  localStorage.setItem('checkpoints', JSON.stringify(DEFAULT_CHECKPOINTS));
  // Dispatch storage event to update other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'checkpoints',
    newValue: JSON.stringify(DEFAULT_CHECKPOINTS)
  }));
};

export const getCheckpoints = (): CheckpointStatus => {
  const savedCheckpoints = localStorage.getItem('checkpoints');
  return savedCheckpoints ? JSON.parse(savedCheckpoints) : DEFAULT_CHECKPOINTS;
};

export const completeCheckpoint = (checkpointNumber: number): void => {
  const currentCheckpoints = getCheckpoints();
  const checkpointKey = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;
  
  // Only update if previous checkpoints are completed
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
    // Dispatch storage event to update other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'checkpoints',
      newValue: JSON.stringify(updatedCheckpoints)
    }));
  }
};