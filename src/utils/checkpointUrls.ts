import { createVerificationEndpoint } from '../api/verificationEndpoint';

// Base URL for your Netlify site
const SITE_URL = 'https://guileless-hummingbird-2428fb.netlify.app';

export const LINKVERTISE_URLS = {
  1: 'https://link-target.net/1174023/check-point-1',
  2: 'https://link-target.net/1174023/check-point-2',
  3: 'https://link-target.net/1174023/check-point-3'
};

export const getCheckpointUrl = async (checkpoint: number): Promise<string> => {
  // Create a verification record and get its ID
  const verification = await createVerificationEndpoint(checkpoint);
  
  // Construct the verification URL that Linkvertise will redirect to
  const verificationUrl = `${SITE_URL}/.netlify/functions/verify/${verification.id}`;
  
  // Set up the target URL in Linkvertise dashboard:
  // Use verificationUrl as the "Target URL" in Linkvertise settings
  
  return LINKVERTISE_URLS[checkpoint as keyof typeof LINKVERTISE_URLS];
};