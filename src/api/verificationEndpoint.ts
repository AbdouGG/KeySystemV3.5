import { supabase } from '../config/supabase';

export const createVerificationEndpoint = async (checkpointNumber: number) => {
  try {
    const { data, error } = await supabase
      .from('checkpoint_verifications')
      .insert([
        { checkpoint_number: checkpointNumber }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating verification endpoint:', error);
    throw error;
  }
};

export const updateVerificationStatus = async (checkpointNumber: number) => {
  try {
    const { error } = await supabase
      .from('checkpoint_verifications')
      .update({ verified: true })
      .eq('checkpoint_number', checkpointNumber);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating verification status:', error);
    return false;
  }
};