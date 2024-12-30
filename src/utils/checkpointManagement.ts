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
  const savedCheckpoints = localStorage.getItem('checkpoints');
  if (savedCheckpoints) {
    return JSON.parse(savedCheckpoints);
  }
  return resetCheckpoints();
};