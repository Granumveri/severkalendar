import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase environment variables are missing! Using placeholder.');
    return createClient('https://aweounqbgshmvxxszgef.supabase.co', 'placeholder');
  }

  supabase = createClient(url, key);
  return supabase;
}
