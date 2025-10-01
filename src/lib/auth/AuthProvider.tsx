import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from './AuthContext';
import { AuthState, AuthUser, AuthProviderProps } from '@/types/auth';
import { Logger } from '@/lib/errors/Logger';
import { AppError } from '@/lib/errors/AppError';

const logger = Logger.getInstance();

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                updateSession(session);
            }
        });

        // Set up auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            updateSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateSession = async (session: Session | null) => {
        if (!session) {
            setState({ user: null, loading: false, error: null });
            return;
        }

        try {
            // Get user's role from the database
            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;

            const user: AuthUser = {
                ...session.user,
                role: profile?.role,
            };

            setState({ user, loading: false, error: null });
        } catch (error) {
            logger.error('Error updating session:', error as Record<string, any>);
            setState({
                user: null,
                loading: false,
                error: new AppError('Failed to get user profile'),
            });
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            updateSession(data.session);
        } catch (error) {
            logger.error('Error signing in:', error as Record<string, any>);
            setState(prev => ({
                ...prev,
                error: new AppError('Failed to sign in'),
            }));
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create user profile with default role
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: data.user.id,
                            role: 'user',
                            email: data.user.email,
                        },
                    ]);

                if (profileError) throw profileError;
            }

            updateSession(data.session);
        } catch (error) {
            logger.error('Error signing up:', error as Record<string, any>);
            setState(prev => ({
                ...prev,
                error: new AppError('Failed to sign up'),
            }));
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setState({ user: null, loading: false, error: null });
        } catch (error) {
            logger.error('Error signing out:', error as Record<string, any>);
            setState(prev => ({
                ...prev,
                error: new AppError('Failed to sign out'),
            }));
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        } catch (error) {
            logger.error('Error resetting password:', error as Record<string, any>);
            setState(prev => ({
                ...prev,
                error: new AppError('Failed to reset password'),
            }));
        }
    };

    const updatePassword = async (password: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) throw error;
        } catch (error) {
            logger.error('Error updating password:', error as Record<string, any>);
            setState(prev => ({
                ...prev,
                error: new AppError('Failed to update password'),
            }));
        }
    };

    const value = {
        state,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
