import { supabase } from '../config/supabase';

export const deleteExpiredKey = async (keyId: string): Promise<boolean> => {
  try {
    // Delete the key directly
    const { error } = await supabase
      .from('keys')
      .delete()
      .eq('id', keyId)
      .eq('is_valid', false); // Only delete if already marked invalid

    if (error) {
      console.error('Error deleting key:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting expired key:', error);
    return false;
  }
};