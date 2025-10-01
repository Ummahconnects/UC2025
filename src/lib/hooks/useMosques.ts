import { useState, useEffect } from 'react';
import { MosqueService } from '../services/mosqueService';
import type { MosqueBase, MosqueWithDetails } from '@/types/mosque';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';

export const useMosques = (page = 1, limit = 10) => {
  const [mosques, setMosques] = useState<MosqueBase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchMosques = async () => {
      try {
        const { mosques: data, total: count } = await MosqueService.getMosques(page, limit);
        setMosques(data);
        setTotal(count);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMosques();
  }, [page, limit, handleError]);

  return { mosques, loading };
};

export const useFeaturedMosques = (limit = 4) => {
  const [mosques, setMosques] = useState<MosqueBase[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchFeaturedMosques = async () => {
      try {
        const data = await MosqueService.getFeaturedMosques(limit);
        setMosques(data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMosques();
  }, [limit, handleError]);

  return { mosques, loading };
};

export const useMosque = (id: string) => {
  const [mosque, setMosque] = useState<MosqueBase | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchMosque = async () => {
      try {
        const data = await MosqueService.getMosqueById(id);
        setMosque(data);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMosque();
    } else {
      setLoading(false);
    }
  }, [id, handleError]);

  return { mosque, loading };
};

export const useNearbyMosques = (
  latitude: number | null,
  longitude: number | null,
  radius = 10,
  limit = 10
) => {
  const [mosques, setMosques] = useState<MosqueBase[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    const fetchNearbyMosques = async () => {
      try {
        if (latitude && longitude) {
          const data = await MosqueService.getNearbyMosques(
            latitude,
            longitude,
            radius,
            limit
          );
          setMosques(data || []);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchNearbyMosques();
    } else {
      setLoading(false);
    }
  }, [latitude, longitude, radius, limit, handleError]);

  return { mosques, loading };
};

export const useSearchMosques = () => {
  const [mosques, setMosques] = useState<MosqueBase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const searchMosques = async (
    query: string,
    page = 1,
    limit = 10,
    filters: {
      city?: string;
      country?: string;
      facilities?: string[];
      services?: string[];
    } = {}
  ) => {
    try {
      setLoading(true);
      const { mosques: results, total: count } = await MosqueService.searchMosques(query, page, limit, filters);
      setMosques(results);
      setTotal(count);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { mosques, loading, searchMosques };
};
