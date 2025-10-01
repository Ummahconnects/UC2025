import { supabase } from '@/integrations/supabase/client';
import type { EventWithDetails } from '@/types/event';
import { logger } from '../errors/Logger';

export interface EventFilters {
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  mosque_id?: string;
  organizer_id?: string;
  is_featured?: boolean;
}

// Mock data for when the database is not available
const mockEvents: EventWithDetails[] = [
  {
    id: '1',
    title: 'Community Iftar Gathering',
    description: 'Join us for a community iftar during Ramadan. Everyone is welcome!',
    date: '2025-07-30',
    time: '19:30:00',
    location: 'Islamic Center, Springfield, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    image: '/images/events/iftar.jpg',
    status: 'upcoming' as const,
    is_featured: true,
    registration_required: false,
    max_attendees: 150,
    current_attendees: 87,
    category: 'Religious',
    tags: ['Ramadan', 'Community', 'Iftar'],
    website: undefined,
    organizer_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Islamic Finance Workshop',
    description: 'Learn about Islamic finance principles and halal investment opportunities.',
    date: '2025-08-05',
    time: '10:00:00',
    location: 'Downtown Business Center, Springfield, USA',
    latitude: 40.7589,
    longitude: -73.9851,
    image: '/images/events/finance.jpg',
    status: 'upcoming' as const,
    is_featured: true,
    registration_required: true,
    max_attendees: 75,
    current_attendees: 42,
    category: 'Educational',
    tags: ['Finance', 'Education', 'Workshop'],
    website: undefined,
    organizer_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Children\'s Quran Competition',
    description: 'Annual Quran recitation competition for children aged 6-15.',
    date: '2025-08-12',
    time: '11:00:00',
    location: 'Al-Huda Academy, Springfield, USA',
    latitude: 40.7505,
    longitude: -73.9934,
    image: '/images/events/quran.jpg',
    status: 'upcoming' as const,
    is_featured: true,
    registration_required: true,
    max_attendees: 100,
    current_attendees: 65,
    category: 'Educational',
    tags: ['Quran', 'Children', 'Competition'],
    website: undefined,
    organizer_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Charity Fundraising Dinner',
    description: 'Annual fundraising dinner to support local community initiatives.',
    date: '2025-08-20',
    time: '18:00:00',
    location: 'Grand Banquet Hall, Springfield, USA',
    latitude: 40.7282,
    longitude: -74.0776,
    image: '/images/events/charity.jpg',
    status: 'upcoming' as const,
    is_featured: true,
    registration_required: true,
    max_attendees: 200,
    current_attendees: 125,
    category: 'Charity',
    tags: ['Charity', 'Fundraising', 'Community'],
    website: undefined,
    organizer_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export class EventService {
  static async getEvents(
    page: number = 1,
    limit: number = 10,
    filters?: EventFilters
  ): Promise<EventWithDetails[]> {
    try {
      let query = supabase.from('events').select('*');

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.mosque_id) {
          query = query.eq('mosque_id', filters.mosque_id);
        }
        if (filters.organizer_id) {
          query = query.eq('organizer_id', filters.organizer_id);
        }
        if (filters.is_featured) {
          query = query.eq('is_featured', filters.is_featured);
        }
        if (filters.latitude && filters.longitude) {
          const radiusKm = filters.radius_km || 10;
          const radiusDegrees = radiusKm / 111;
          
          query = query
            .gte('latitude', filters.latitude - radiusDegrees)
            .lte('latitude', filters.latitude + radiusDegrees)
            .gte('longitude', filters.longitude - radiusDegrees)
            .lte('longitude', filters.longitude + radiusDegrees)
            .order('date', { ascending: true });
        }
      }

      // Add pagination
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching events from database, using mock data:', { error });
        return this.getFilteredMockEvents(page, limit, filters);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getEvents, using mock data:', { error });
      return this.getFilteredMockEvents(page, limit, filters);
    }
  }

  static async getFeaturedEvents(limit = 6): Promise<EventWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'upcoming')
        .order('date', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Error fetching featured events from database, using mock data:', { error });
        return mockEvents.filter(event => event.is_featured).slice(0, limit);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getFeaturedEvents, using mock data:', { error });
      return mockEvents.filter(event => event.is_featured).slice(0, limit);
    }
  }

  private static getFilteredMockEvents(
    page: number = 1,
    limit: number = 10,
    filters?: EventFilters
  ): EventWithDetails[] {
    let filteredEvents = [...mockEvents];

    // Apply filters to mock data
    if (filters) {
      if (filters.status) {
        filteredEvents = filteredEvents.filter(event => event.status === filters.status);
      }
      if (filters.category) {
        filteredEvents = filteredEvents.filter(event => event.category === filters.category);
      }
      if (filters.is_featured !== undefined) {
        filteredEvents = filteredEvents.filter(event => event.is_featured === filters.is_featured);
      }
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return filteredEvents.slice(start, end);
  }
}
