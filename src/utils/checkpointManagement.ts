import { CheckpointStatus } from '../types';

export const resetCheckpoints = () => {
  const resetStatus: CheckpointStatus = {
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false,
  };
  localStorage.setItem('checkpoints', JSON.stringify(resetStatus));
  return resetStatus;
};

export const getCheckpoints = (): CheckpointStatus => {
  try {
    const savedCheckpoints = localStorage.getItem('checkpoints');
    if (savedCheckpoints) {
      const parsed = JSON.parse(savedCheckpoints);
      // Validate the structure
      if (
        typeof parsed === 'object' &&
        'checkpoint1' in parsed &&
        'checkpoint2' in parsed &&
        'checkpoint3' in parsed
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error parsing checkpoints:', error);
  }
  return resetCheckpoints();
};

export const saveCheckpoints = (checkpoints: CheckpointStatus): void => {
  localStorage.setItem('checkpoints', JSON.stringify(checkpoints));
};