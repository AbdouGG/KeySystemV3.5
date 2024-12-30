import { supabase } from '../config/supabase';

export const deleteExpiredKey = async (keyId: string): Promise<void> => {
  try {
    // First invalidate the key
    const { error: updateError } = await supabase
      .from('keys')
      .update({ is_valid: false })
      .eq('id', keyId);

    if (updateError) {
      console.error('Error invalidating key:', updateError);
      return;
    }

    // Wait 2 seconds before deletion
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Delete the key
    const { error: deleteError } = await supabase
      .from('keys')
      .delete()
      .eq('id', keyId);

    if (deleteError) {
      console.error('Error deleting key:', deleteError);
    }
  } catch (error) {
    console.error('Error handling expired key:', error);
  }
};