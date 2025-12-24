import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aweounqbgshmvxxszgef.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZW91bnFiZ3NobXZ4eHN6Z2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTAxODQsImV4cCI6MjA4MTk2NjE4NH0._u8JGAsybpw7jFqYu606hMF40Bev6fZf4kJoRX1lRQE';

  if (!url || !key || key === 'placeholder') {
    console.error('Supabase configuration is missing!');
    return createClient('https://aweounqbgshmvxxszgef.supabase.co', 'placeholder');
  }

  supabase = createClient(url, key);
  return supabase;
}
