import { supabase } from '../config/supabase';

export const deleteExpiredKey = async (keyId: string): Promise<void> => {
  try {
    await supabase
      .from('keys')
      .delete()
      .eq('id', keyId);
  } catch (error) {
    console.error('Error deleting expired key:', error);
  }
};