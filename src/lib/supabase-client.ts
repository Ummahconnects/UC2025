import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Singleton pattern to ensure only one instance of the Supabase client is created across the app.
 * 
 * NOTE: In development mode with React StrictMode, you might still see the 
 * "Multiple GoTrueClient instances detected" warning because StrictMode 
 * mounts components twice to help detect side effects. This is normal and 
 * won't happen in production.
 */
let supabaseInstance: SupabaseClient | null = null;

// Use a global initialized flag to prevent race conditions
let isInitializing = false;

// This function creates or returns the existing Supabase client instance
function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Prevent concurrent initialization attempts
  if (isInitializing) {
    throw new Error('Supabase client is being initialized. Please wait for initialization to complete.');
  }

  isInitializing = true;
  try {
    // Try to get environment variables from multiple sources with fallback for production
    let URL = '';
    let KEY = '';

    // Try import.meta.env (Vite)
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
        KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
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
  
    console.log('🎯 Supabase URL at init:', URL);
    
    // Create a single instance and store it
    supabaseInstance = createClient(URL, KEY);
    
    // Reset initializing flag
    isInitializing = false;
  
  return supabaseInstance;
  } catch (error) {
    // Reset initializing flag even if there's an error
    isInitializing = false;
    throw error;
  }
}

// Export the singleton instance
export const supabase = getSupabaseClient();
