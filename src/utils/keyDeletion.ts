import { supabase } from '../config/supabase';

export const deleteExpiredKey = async (keyId: string): Promise<void> => {
  try {
    // First invalidate the key
    await supabase
      .from('keys')
      .update({ is_valid: false })
      .eq('id', keyId);

    // Then delete after a short delay
    setTimeout(async () => {
      await supabase
        .from('keys')
        .delete()
        .eq('id', keyId);
    }, 500);
  } catch (error) {
    console.error('Error handling expired key:', error);
  }
};