import { supabase } from '@/integrations/supabase/client';
import { logger } from '../errors/Logger';
import { AppError, NotFoundError, AuthenticationError } from '../errors/AppError';
import type { Profile, BusinessOwner, Individual, MosqueAdmin } from '@/types/client';

class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async handleError(error: any, context?: Record<string, any>): Promise<never> {
    if (error instanceof AppError) {
      logger.error(error, context);
      throw error;
    }

    // Handle Supabase errors
    if (error.code === 'PGRST301') {
      throw new NotFoundError(context?.resource || 'Resource');
    }
    if (error.code === 'PGRST204') {
      throw new AuthenticationError();
    }

    // Log unknown errors
    const appError = new AppError(
      error.message || 'An unexpected error occurred',
      500,
      false,
      { originalError: error, ...context }
    );
    logger.error(appError);
    throw appError;
  }

  // Auth methods
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      logger.info('User signed in successfully', { email });
      return data;
    } catch (error) {
      return this.handleError(error, { email });
    }
  }

  async signUp(email: string, password: string, userType: 'individual' | 'business_owner' | 'mosque_admin') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        await this.createProfile(data.user.id, {
          email,
          type: userType,
        });
      }

      logger.info('User signed up successfully', { email, userType });
      return data;
    } catch (error) {
      return this.handleError(error, { email, userType });
    }
  }

  // Profile methods
  async createProfile(userId: string, profile: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ user_id: userId, ...profile }])
        .select()
        .single();

      if (error) throw error;
      logger.info('Profile created successfully', { userId });
      return data;
    } catch (error) {
      return this.handleError(error, { userId, profile });
    }
  }

  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Profile');
      
      return data as Profile;
    } catch (error) {
      return this.handleError(error, { userId });
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      logger.info('Profile updated successfully', { userId });
      return data as Profile;
    } catch (error) {
      return this.handleError(error, { userId, updates });
    }
  }

  // Business methods
  async getBusinessOwner(userId: string) {
    try {
      const { data, error } = await supabase
        .from('business_owners')
        .select(`
          *,
          profiles:user_id(*),
          businesses(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('BusinessOwner');

      return data as BusinessOwner;
    } catch (error) {
      return this.handleError(error, { userId });
    }
  }

  // Mosque methods
  async getMosqueAdmin(userId: string) {
    try {
      const { data, error } = await supabase
        .from('mosque_admins')
        .select(`
          *,
          profiles:user_id(*),
          mosques(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('MosqueAdmin');

      return data as MosqueAdmin;
    } catch (error) {
      return this.handleError(error, { userId });
    }
  }

  // Individual methods
  async getIndividual(userId: string) {
    try {
      const { data, error } = await supabase
        .from('individuals')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!data) throw new NotFoundError('Individual');

      return data as Individual;
    } catch (error) {
      return this.handleError(error, { userId });
    }
  }
}

export const apiClient = ApiClient.getInstance();
