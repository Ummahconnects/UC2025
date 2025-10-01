// src/lib/supabaseClient.fix.ts
// Fixed version of the Supabase client to ensure it works in all environments

import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Singleton pattern with built-in fallbacks for production
 * This ensures the client will always initialize even if environment variables aren't properly set
 */
let supabaseInstance: SupabaseClient | null = null;

// This function creates or returns the existing Supabase client instance
function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    // Try to get environment variables
    let URL = '';
    let KEY = '';

    // First try import.meta.env (Vite)
    try {
      URL = import.meta.env?.VITE_SUPABASE_URL;
      KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    } catch (e) {
      console.warn('Unable to access import.meta.env, will try process.env next');
    }

    // Then try process.env (Next.js and others)
    if (!URL || !KEY) {
      try {
        URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      } catch (e) {
        console.warn('Unable to access process.env');
      }
    }

    // Finally use hardcoded fallback if all else fails (for production builds)
    if (!URL || !KEY) {
      console.warn('❗ No environment variables found for Supabase, using fallback values');
      URL = 'https://qfkrqcdibddicppqpfng.supabase.co';
      KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma3JxY2RpYmRkaWNwcHFwZm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NDA3ODcsImV4cCI6MjA2MTIxNjc4N30.DJiXp5zheBIVtfZnDBvu_VeSa_NGH-_8Ifj4Vsp4-Mc';
    }

    // Create the client instance
    console.log('🔄 Initializing Supabase client...');
    supabaseInstance = createClient(URL, KEY);
    console.log('✅ Supabase client initialized successfully');
    
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    throw error;
  }
}

// Export the singleton instance
export const supabase = getSupabaseClient();

// Debugging function to check connection
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('businesses').select('count(*)', { count: 'exact' }).limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test threw an exception:', error);
    return false;
  }
}
