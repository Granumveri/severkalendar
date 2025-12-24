import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aweounqbgshmvxxszgef.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Supabase environment variables are missing!');
    if (typeof window !== 'undefined') {
      console.log('Environment check:', { 
        url: !!url, 
        key: !!key,
        all_env: Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
      });
    }
    // Fallback to the known public URL and a placeholder if key is missing
    // In a real app, you'd want the real key here if possible
    return createClient(url || 'https://aweounqbgshmvxxszgef.supabase.co', key || 'placeholder');
  }

  supabase = createClient(url, key);
  return supabase;
}
