import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EventWithDetails } from '@/types/event';
import { logger } from '../errors/Logger';

export function useEventsFeed(limit: number = 5) {
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'upcoming')
          .order('date', { ascending: true })
          .limit(limit);
          
        if (error) throw error;
        
        setEvents(data || []);
      } catch (err) {
        logger.error('Error fetching events:', { error: err });
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [limit]);

  return { events, loading, error };
}
