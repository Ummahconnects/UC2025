import { useState, useEffect } from 'react';
import { EventService, type EventFilters } from '../services/eventService';
import type { EventWithDetails } from '@/types/event';

interface UseEventsResult {
  events: EventWithDetails[];
  loading: boolean;
  error: Error | null;
  total: number;
  fetchEvents: (page?: number, filters?: EventFilters) => Promise<void>;
}

export function useEvents(
  initialPage: number = 1,
  limit: number = 10,
  initialFilters?: EventFilters
): UseEventsResult {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEvents = async (page: number = initialPage, filters?: EventFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await EventService.getEvents(page, limit, filters);
      setEvents(result);
      setTotal(result.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(initialPage, initialFilters);
  }, [initialPage, limit, initialFilters]);

  return {
    events,
    loading,
    error,
    total,
    fetchEvents
  };
}

interface UseFeaturedEventsResult {
  events: EventWithDetails[];
  loading: boolean;
  error: Error | null;
}

export function useFeaturedEvents(limit = 6): UseFeaturedEventsResult {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeaturedEvents() {
      try {
        setLoading(true);
        const result = await EventService.getFeaturedEvents(limit);
        setEvents(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch featured events'));
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedEvents();
  }, [limit]);

  return {
    events,
    loading,
    error
  };
}
