import { getFromDB, setInDB } from './indexedDB';

const VERIFICATION_KEY = 'checkpoint_verification';
const CHECKPOINTS_KEY = 'checkpoints';

export class PersistentStorage {
  private static instance: PersistentStorage;
  private verificationToken: string;

  private constructor() {
    this.verificationToken = crypto.randomUUID();
  }

  static getInstance() {
    if (!PersistentStorage.instance) {
      PersistentStorage.instance = new PersistentStorage();
    }
    return PersistentStorage.instance;
  }

  async initialize() {
    // Set up verification token in both storages
    await this.setVerificationToken();
    return this.verifyStorage();
  }

  private async setVerificationToken() {
    try {
      localStorage.setItem(VERIFICATION_KEY, this.verificationToken);
      await setInDB(VERIFICATION_KEY, this.verificationToken);
    } catch (error) {
      console.error('Error setting verification token:', error);
    }
  }

  private async verifyStorage(): Promise<boolean> {
    try {
      const localToken = localStorage.getItem(VERIFICATION_KEY);
      const indexedToken = await getFromDB(VERIFICATION_KEY);
      return localToken === indexedToken && localToken === this.verificationToken;
    } catch (error) {
      console.error('Error verifying storage:', error);
      return false;
    }
  }

  async getCheckpoints() {
    try {
      if (!await this.verifyStorage()) {
        throw new Error('Storage verification failed');
      }

      const localCheckpoints = localStorage.getItem(CHECKPOINTS_KEY);
      const indexedCheckpoints = await getFromDB(CHECKPOINTS_KEY);

      // Use IndexedDB as source of truth if available
      if (indexedCheckpoints) {
        localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(indexedCheckpoints));
        return indexedCheckpoints;
      }

      // Fall back to localStorage if IndexedDB is empty
      if (localCheckpoints) {
        const parsed = JSON.parse(localCheckpoints);
        await setInDB(CHECKPOINTS_KEY, parsed);
        return parsed;
      }

      // Default state if neither exists
      const defaultCheckpoints = {
        checkpoint1: false,
        checkpoint2: false,
        checkpoint3: false,
      };

      await this.setCheckpoints(defaultCheckpoints);
      return defaultCheckpoints;
    } catch (error) {
      console.error('Error getting checkpoints:', error);
      return null;
    }
  }

  async setCheckpoints(checkpoints: any) {
    try {
      if (!await this.verifyStorage()) {
        throw new Error('Storage verification failed');
      }

      localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(checkpoints));
      await setInDB(CHECKPOINTS_KEY, checkpoints);
      window.dispatchEvent(new Event('checkpointsUpdated'));
      return true;
    } catch (error) {
      console.error('Error setting checkpoints:', error);
      return false;
    }
  }
}