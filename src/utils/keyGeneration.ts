import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { supabase } from '../config/supabase';
import { getUserId } from './userId';

export const generateKey = async () => {
  const key = uuidv4();
  const now = new Date();
  const expiresAt = addHours(now, 24);
  const userId = await getUserId();

  // Create new key with user ID
  const { data, error } = await supabase
    .from('keys')
    .insert([
      {
        key,
        user_id: userId,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_valid: true
      }
    ])
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Failed to generate key');
  
  return data[0];
};