import { useState, useEffect, useCallback } from 'react';
import { BusinessService, type BusinessFilters } from '../services/businessService';
import type { BusinessWithDetails } from '@/types/business';

interface UseBusinessesResult {
  businesses: BusinessWithDetails[];
  loading: boolean;
  error: Error | null;
  total: number;
  fetchBusinesses: (page?: number, filters?: BusinessFilters) => Promise<void>;
}

export function useBusinesses(
  initialPage: number = 1,
  limit: number = 10,
  initialFilters: BusinessFilters = {}
): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchBusinesses = useCallback(async (page: number = initialPage, filters: BusinessFilters = initialFilters) => {
    if (filters && 'owner_id' in filters && !filters.owner_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await BusinessService.getBusinesses(page, limit, filters);
      setBusinesses(result);
      setTotal(result.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch businesses'));
    } finally {
      setLoading(false);
    }
  }, [initialPage, limit, initialFilters]);

  useEffect(() => {
    if (initialFilters?.owner_id) {
      fetchBusinesses(initialPage, initialFilters);
    } else if (!initialFilters?.owner_id) {
      fetchBusinesses(initialPage, initialFilters);
    }
  }, [initialPage, initialFilters, fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    total,
    fetchBusinesses
  };
}

interface UseFeaturedBusinessesResult {
  businesses: BusinessWithDetails[];
  loading: boolean;
  error: Error | null;
}

export function useFeaturedBusinesses(limit: number = 8): UseFeaturedBusinessesResult {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeaturedBusinesses() {
      try {
        setLoading(true);
        const result = await BusinessService.getFeaturedBusinesses(limit);
        setBusinesses(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch featured businesses'));
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedBusinesses();
  }, [limit]);

  return {
    businesses,
    loading,
    error
  };
}

interface UseBusinessResult {
  business: BusinessWithDetails | null;
  loading: boolean;
  error: Error | null;
}

export function useBusiness(id: string | undefined): UseBusinessResult {
  const [business, setBusiness] = useState<BusinessWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await BusinessService.getBusinessById(id);
        setBusiness(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch business'));
      } finally {
        setLoading(false);
      }
    }

    fetchBusiness();
  }, [id]);

  return {
    business,
    loading,
    error
  };
}
