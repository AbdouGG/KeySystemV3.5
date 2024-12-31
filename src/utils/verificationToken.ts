import { supabase } from '../config/supabase';
import { getHWID } from './hwid';

export const generateVerificationToken = async (checkpointNumber: number): Promise<string> => {
  const hwid = getHWID();
  const timestamp = Date.now();
  const token = btoa(`${hwid}-${checkpointNumber}-${timestamp}`);

  try {
    const { error } = await supabase
      .from('verification_tokens')
      .insert([
        {
          token,
          hwid,
          checkpoint_number: checkpointNumber,
          expires_at: new Date(timestamp + 5 * 60 * 1000), // 5 minutes expiry
          used: false
        }
      ]);

    if (error) throw error;
    return token;
  } catch (error) {
    console.error('Error generating verification token:', error);
    throw new Error('Failed to generate verification token');
  }
};