import { openDB } from 'idb';

const DB_NAME = 'keySystemDB';
const STORE_NAME = 'checkpoints';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const getFromDB = async (key: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, key);
};

export const setInDB = async (key: string, value: any) => {
  const db = await initDB();
  return db.put(STORE_NAME, value, key);
};