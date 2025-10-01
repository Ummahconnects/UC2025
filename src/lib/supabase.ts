import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton pattern for Supabase client
let supabaseInstance = null;

export const supabase = () => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'UmmahConnectsSB',
        persistSession: true,
        storage: window.localStorage
      }
    });
  }
  return supabaseInstance;
};
