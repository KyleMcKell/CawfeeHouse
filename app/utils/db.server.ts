import { createClient } from '@supabase/supabase-js';

// see documention about using .env variables
// https://remix.run/docs/en/v1/guides/envvars#server-environment-variables
const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL must be set!');
}
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error('SUPABASE_ANON_KEY must be set!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
