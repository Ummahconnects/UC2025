// src/contexts/auth/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabaseClient as supabase } from '@/lib/supabaseClient.ts';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  isSigningIn: boolean;
  resetPassword: (email: string) => Promise<{ error?: Error | null }>;
  updatePassword: (password: string) => Promise<{ error?: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const currentSession = data.session;
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setIsStaff(currentUser?.user_metadata.role === 'staff');
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setIsStaff(currentUser?.user_metadata.role === 'staff');
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    setIsSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsSigningIn(false);
    }
  }

  async function login(email: string, password: string) {
    const { error } = await signIn(email, password);
    if (error) throw error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/auth');
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error };
    return { error: null };
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error };
    return { error: null };
  }

  const value = {
    user,
    session,
    loading,
    isStaff,
    signIn,
    signUp,
    signOut,
    login,
    isSigningIn,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
