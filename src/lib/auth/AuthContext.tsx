import { createContext } from 'react';
import { AuthState } from '@/types/auth';

// Initialize with default values
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Create and export the auth context
export const AuthContext = createContext<{
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}>({
  state: initialState,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});
