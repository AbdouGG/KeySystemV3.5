import { supabase } from '../config/supabase';

export const verifyCheckpoint = async (checkpointNumber: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('checkpoint_verifications')
      .select('verified')
      .eq('checkpoint_number', checkpointNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.verified || false;
  } catch (error) {
    console.error('Error verifying checkpoint:', error);
    return false;
  }
};