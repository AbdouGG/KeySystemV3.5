import { v4 as uuidv4 } from 'uuid';

// Generate a unique hardware ID based on browser fingerprinting
export const getHWID = (): string => {
  const storedHWID = localStorage.getItem('hwid');
  if (storedHWID) return storedHWID;

  // Create a fingerprint based on available browser data
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Generate a consistent HWID from the fingerprint
  const hwid = `HWID-${fingerprint.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) >>> 0;
  }, 0).toString(16)}`;

  localStorage.setItem('hwid', hwid);
  return hwid;
};