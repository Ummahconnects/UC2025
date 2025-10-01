import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read from Vite env first, then fall back to process.env in CI
const URL = (import.meta as any)?.env?.VITE_SUPABASE_URL
  || process.env.VITE_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL
  || '';
const KEY = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || '';

export const supabase: SupabaseClient | null = (URL && KEY) ? createClient(URL, KEY) : null;
export default supabase;

