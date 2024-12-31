import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
    // Check for rate limiting
    const { count } = await supabase
      .from('verification_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('hwid', hwid)
      .eq('checkpoint_number', checkpointNumber)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (count && count >= 3) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Too many verification attempts. Please wait 5 minutes.' }),
      };
    }

    // Generate a verification token with additional security measures
    const timestamp = Date.now();
    const randomId = uuidv4();
    const token = Buffer.from(
      `${hwid}-${checkpointNumber}-${timestamp}-${randomId}`
    ).toString('base64');

    // Store the token with a shorter expiration
    const { error } = await supabase.from('verification_tokens').insert([
      {
        token,
        hwid,
        checkpoint_number: checkpointNumber,
        expires_at: new Date(timestamp + 2 * 60 * 1000), // 2 minutes expiry
        used: false,
      },
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