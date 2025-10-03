import { useState, useEffect } from 'react';
import { BusinessService } from '@/lib/services/businessService.ts';
import type { BusinessWithDetails } from '@/types/business';

export const useFeaturedBusinesses = (limit = 8) => {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFeaturedBusinesses = async () => {
      try {
        const result = await BusinessService.getFeaturedBusinesses(limit);
        setBusinesses(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching featured businesses:', err);
        setError(err as Error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBusinesses();
  }, [limit]);

  return { businesses, loading, error };
};
