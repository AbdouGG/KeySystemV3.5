import { createVerificationEndpoint } from '../api/verificationEndpoint';

export const LINKVERTISE_URLS = {
  1: 'https://link-target.net/1174023/check-point-1',
  2: 'https://link-target.net/1174023/check-point-2',
  3: 'https://link-target.net/1174023/check-point-3',
};

export const getCheckpointUrl = async (checkpoint: number): Promise<string> => {
  // Create a verification record and get its ID
  const verification = await createVerificationEndpoint(checkpoint);

  // Return the specific Linkvertise URL for this checkpoint
  return LINKVERTISE_URLS[checkpoint as keyof typeof LINKVERTISE_URLS];
};
