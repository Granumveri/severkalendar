import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// This is for general use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This is for client components in Next.js
export const createClientClient = () => {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
};
