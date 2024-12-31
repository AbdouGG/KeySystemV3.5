import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  // Get the checkpoint number and HWID from the URL
  const parts = event.path.split('/');
  const checkpointNumber = parseInt(parts[parts.length - 2], 10);
  const hwid = parts[parts.length - 1];

  if (!checkpointNumber || !hwid) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing checkpoint number or HWID' }),
    };
  }

  try {
    // Generate a verification token
    const timestamp = Date.now();
    const token = Buffer.from(`${hwid}-${checkpointNumber}-${timestamp}`).toString('base64');

    // Store the token in Supabase
    const { error } = await supabase
      .from('verification_tokens')
      .insert([
        {
          token,
          hwid,
          checkpoint_number: checkpointNumber,
          expires_at: new Date(timestamp + 5 * 60 * 1000), // 5 minutes expiry
          used: false
        }
      ]);

    if (error) throw error;

    // Redirect to the checkpoint verification page with the token
    return {
      statusCode: 302,
      headers: {
        Location: `/checkpoint/${checkpointNumber}?token=${encodeURIComponent(token)}`,
      },
      body: '',
    };
  } catch (error) {
    console.error('Error generating verification token:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate verification token' }),
    };
  }
};