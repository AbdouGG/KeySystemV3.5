import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';

// Get or create a persistent user ID
export const getUserId = async (): Promise<string> => {
  // Try to get existing user ID from localStorage
  const storedUserId = localStorage.getItem('persistent_user_id');
  if (storedUserId) {
    return storedUserId;
  }

  // Generate new user ID
  const newUserId = `USER-${uuidv4()}`;
  localStorage.setItem('persistent_user_id', newUserId);
  
  return newUserId;
};