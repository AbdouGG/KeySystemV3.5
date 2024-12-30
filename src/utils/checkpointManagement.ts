import { PersistentStorage } from './storage/persistentStorage';
import type { CheckpointStatus } from '../types';

const storage = PersistentStorage.getInstance();

export const initializeCheckpoints = async () => {
  await storage.initialize();
};

export const getCheckpoints = async (): Promise<CheckpointStatus> => {
  const checkpoints = await storage.getCheckpoints();
  return checkpoints || {
    checkpoint1: false,
    checkpoint2: false,
    checkpoint3: false,
  };
};

export const completeCheckpoint = async (checkpointNumber: number): Promise<boolean> => {
  try {
    const currentCheckpoints = await getCheckpoints();
    
    // Validate checkpoint number and prerequisites
    if (![1, 2, 3].includes(checkpointNumber)) return false;
    if (checkpointNumber === 2 && !currentCheckpoints.checkpoint1) return false;
    if (checkpointNumber === 3 && (!currentCheckpoints.checkpoint1 || !currentCheckpoints.checkpoint2)) return false;

    const checkpointKey = `checkpoint${checkpointNumber}` as keyof CheckpointStatus;
    const updatedCheckpoints = {
      ...currentCheckpoints,
      [checkpointKey]: true,
    };

    return await storage.setCheckpoints(updatedCheckpoints);
  } catch (error) {
    console.error('Error completing checkpoint:', error);
    return false;
  }
};