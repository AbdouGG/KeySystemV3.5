import { LINKVERTISE_URLS } from './constants';

export const getCheckpointUrl = async (checkpoint: number): Promise<string> => {
  return LINKVERTISE_URLS[checkpoint as keyof typeof LINKVERTISE_URLS] || '';
};