import { supabase } from '../config/supabase';

export const invalidateKey = async (keyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('keys')
      .update({ is_valid: false })
      .eq('id', keyId);

    if (error) {
      console.error('Error invalidating key:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error during key invalidation:', error);
    return false;
  }
};