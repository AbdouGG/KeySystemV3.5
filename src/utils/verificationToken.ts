import { supabase } from '../config/supabase';
import { getUserId } from './userId';

export const verifyToken = async (
  token: string,
  checkpointNumber: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('checkpoint_number', checkpointNumber)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return false;

    // Mark token as used
    await supabase
      .from('verification_tokens')
      .update({ used: true })
      .eq('token', token);

    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};