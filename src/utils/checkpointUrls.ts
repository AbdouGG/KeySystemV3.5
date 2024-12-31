import { LINKVERTISE_URLS } from './constants';
import { generateVerificationToken } from './verificationToken';

export const getCheckpointUrl = async (checkpoint: number): Promise<string> => {
  const token = await generateVerificationToken(checkpoint);
  const baseUrl = LINKVERTISE_URLS[checkpoint as keyof typeof LINKVERTISE_URLS];
  return `${baseUrl}?token=${encodeURIComponent(token)}`;
};