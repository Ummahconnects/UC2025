import { useState, useEffect } from 'react';
import { BusinessService } from '../services/businessService';
import { useErrorHandler } from './useErrorHandler';
import type { BusinessWithDetails } from '../../types/business';

export const useFeaturedBusinesses = (limit = 6) => {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchFeaturedBusinesses = async () => {
      try {
        const data = await BusinessService.getFeaturedBusinesses(limit);
        setBusinesses(data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBusinesses();
  }, [limit, handleError]);

  return { businesses, loading };
};
