import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import type { Profile, BusinessOwner, Individual, MosqueAdmin } from '@/types/client';

interface UseProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export function useProfile(userId?: string): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getProfile(userId);
        setProfile(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId || !profile) return;

    try {
      const updated = await apiClient.updateProfile(userId, updates);
      setProfile(updated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}

interface UseBusinessOwnerResult {
  businessOwner: BusinessOwner | null;
  loading: boolean;
  error: Error | null;
}

export function useBusinessOwner(userId?: string): UseBusinessOwnerResult {
  const [businessOwner, setBusinessOwner] = useState<BusinessOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadBusinessOwner() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getBusinessOwner(userId);
        setBusinessOwner(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load business owner'));
      } finally {
        setLoading(false);
      }
    }

    loadBusinessOwner();
  }, [userId]);

  return { businessOwner, loading, error };
}

interface UseMosqueAdminResult {
  mosqueAdmin: MosqueAdmin | null;
  loading: boolean;
  error: Error | null;
}

export function useMosqueAdmin(userId?: string): UseMosqueAdminResult {
  const [mosqueAdmin, setMosqueAdmin] = useState<MosqueAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadMosqueAdmin() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getMosqueAdmin(userId);
        setMosqueAdmin(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load mosque admin'));
      } finally {
        setLoading(false);
      }
    }

    loadMosqueAdmin();
  }, [userId]);

  return { mosqueAdmin, loading, error };
}

interface UseIndividualResult {
  individual: Individual | null;
  loading: boolean;
  error: Error | null;
}

export function useIndividual(userId?: string): UseIndividualResult {
  const [individual, setIndividual] = useState<Individual | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadIndividual() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getIndividual(userId);
        setIndividual(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load individual'));
      } finally {
        setLoading(false);
      }
    }

    loadIndividual();
  }, [userId]);

  return { individual, loading, error };
}
