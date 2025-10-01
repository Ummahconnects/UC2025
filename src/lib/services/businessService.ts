import { supabase } from '@/lib/supabaseClient';
import type { BusinessWithDetails } from '@/types/business';

// Calculate distance between two points using Haversine formula (like Google)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export interface EnhancedBusinessFilters {
  business_type?: string;
  city?: string;
  country?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

// Simple cache to improve performance
const businessCache = {
  data: [] as BusinessWithDetails[],
  lastFetch: 0,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

export class BusinessService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get businesses with enhanced filtering and location support
   * Queries ALL business tables (businesses, business, mosques)
   */
  static async getBusinesses(
    page: number = 1,
    limit: number = 20,
    userLocation?: { lat: number; lng: number },
    filters?: EnhancedBusinessFilters
  ): Promise<BusinessWithDetails[]> {
    try {
      console.log('[BusinessService] Fetching businesses from ALL tables', { page, limit, filters });
      
      // Check cache first
      const now = Date.now();
      const cacheValid = businessCache.data.length > 0 && 
                        (now - businessCache.lastFetch) < businessCache.cacheTimeout;
      
      if (cacheValid && !filters) {
        console.log('[BusinessService] Using cached data');
        return businessCache.data.slice((page - 1) * limit, page * limit);
      }
      
      // Create queries for all business tables
      const queries = [];
      
      // Query 1: 'businesses' table
      let query1 = supabase.from('businesses').select('*');
      if (filters) {
        if (filters.business_type) query1 = query1.eq('business_type', filters.business_type);
        if (filters.city) query1 = query1.ilike('city', `%${filters.city}%`);
        if (filters.country) query1 = query1.eq('country', filters.country);
        if (filters.rating) query1 = query1.gte('rating', filters.rating);
      }
      queries.push(query1);
      
      // Query 2: 'business' table
      let query2 = supabase.from('business').select('*');
      if (filters) {
        if (filters.business_type) query2 = query2.eq('business_type', filters.business_type);
        if (filters.city) query2 = query2.ilike('city', `%${filters.city}%`);
        if (filters.country) query2 = query2.eq('country', filters.country);
        if (filters.rating) query2 = query2.gte('rating', filters.rating);
      }
      queries.push(query2);
      
      // Query 3: 'business_unified' table
      let query3 = supabase.from('business_unified').select('*');
      if (filters) {
        if (filters.business_type) query3 = query3.eq('business_type', filters.business_type);
        if (filters.city) query3 = query3.ilike('city', `%${filters.city}%`);
        if (filters.country) query3 = query3.eq('country', filters.country);
        if (filters.rating) query3 = query3.gte('rating', filters.rating);
      }
      queries.push(query3);
      
      // Query 4: 'mosques' table
      let query4 = supabase.from('mosques').select('*');
      if (filters) {
        // Mosques might not have business_type, use category if available
        if (filters.business_type) query4 = query4.eq('category', filters.business_type);
        if (filters.city) query4 = query4.ilike('city', `%${filters.city}%`);
        if (filters.country) query4 = query4.eq('country', filters.country);
        if (filters.rating) query4 = query4.gte('rating', filters.rating);
      }
      queries.push(query4);
      
      // Execute all queries in parallel
      const results = await Promise.all(queries);
      
      // Combine and deduplicate results (by ID)
      const businessMap = new Map<string | number, BusinessWithDetails>();
      
      results.forEach((result, index) => {
        const { data, error } = result;
        
        if (error) {
          console.warn(`[BusinessService] Error fetching from table ${index}:`, error);
          return;
        }
        
        if (data && Array.isArray(data)) {
          data.forEach(business => {
            if (business.id) {
              // Normalize featured/is_featured fields and location fields
              const normalizedBusiness = {
                ...business,
                featured: business.featured || business.is_featured || false,
                is_featured: business.is_featured || business.featured || false,
                // Normalize location field names (some tables use longitude/latitude, others use lng/lat)
                latitude: business.latitude || business.lat || null,
                longitude: business.longitude || business.lng || null
              };
              businessMap.set(business.id, normalizedBusiness);
            }
          });
        }
      });
      
      let businesses = Array.from(businessMap.values()) as BusinessWithDetails[];
      
      // Apply location-based filtering if provided
      if (userLocation?.lat && userLocation?.lng) {
        // Get user coordinates
        const userLat = userLocation.lat;
        const userLng = userLocation.lng;
        const userCity = userLocation.city || 'Perth';
        
        console.log(`[BusinessService] User coordinates: ${userLat}, ${userLng} (${userCity})`);
        
        // Calculate distance for each business
        const businessesWithDistance = businesses.map(business => {
          const businessLat = business.latitude || business.lat || 0;
          const businessLng = business.longitude || business.lng || 0;
          
          // Skip businesses without coordinates
          if (businessLat === 0 || businessLng === 0) {
            return {
              ...business,
              distance: Infinity
            };
          }
          
          // Calculate distance using Haversine formula
          const distance = calculateDistance(userLat, userLng, businessLat, businessLng);
          
          return {
            ...business,
            distance
          };
        });
        
        // COORDINATE-BASED PRIMARY SEARCH with broader filter fallback
        console.log('[BusinessService] COORDINATE-BASED: Using coordinates as primary, broadening filter');
        
        // 1. PRIMARY: Businesses with coordinates within 50km
        const localBusinesses = businessesWithDistance.filter(business => business.distance <= 50);
        
        // 2. SECONDARY: Businesses with coordinates within 200km
        const regionalBusinesses = businessesWithDistance.filter(business => 
          business.distance > 50 && business.distance <= 200
        );
        
        // 3. TERTIARY: Businesses with coordinates within 1000km
        const nationalBusinesses = businessesWithDistance.filter(business => 
          business.distance > 200 && business.distance <= 1000
        );
        
        // 4. FALLBACK: Businesses without coordinates, filtered by city
        const fallbackBusinesses = businessesWithDistance.filter(business => {
          const businessLat = business.latitude || business.lat || 0;
          const businessLng = business.longitude || business.lng || 0;
          const noCoordinates = businessLat === 0 || businessLng === 0;
          const matchesCity = business.city?.toLowerCase().includes(userCity.toLowerCase());
          const matchesState = business.state?.toLowerCase().includes('western australia');
          
          return noCoordinates && (matchesCity || matchesState);
        });
        
        // 5. GLOBAL: All other businesses
        const globalBusinesses = businessesWithDistance.filter(business => {
          const businessLat = business.latitude || business.lat || 0;
          const businessLng = business.longitude || business.lng || 0;
          const noCoordinates = businessLat === 0 || businessLng === 0;
          const matchesCity = business.city?.toLowerCase().includes(userCity.toLowerCase());
          const matchesState = business.state?.toLowerCase().includes('western australia');
          
          return noCoordinates && !matchesCity && !matchesState;
        });
        
        // Combine with priority: local → regional → national → fallback → global
        const prioritizedBusinesses = [
          ...localBusinesses,
          ...regionalBusinesses,
          ...nationalBusinesses,
          ...fallbackBusinesses,
          ...globalBusinesses
        ];
        
        console.log(`[BusinessService] Found ${localBusinesses.length} local (50km), ${regionalBusinesses.length} regional (200km), ${nationalBusinesses.length} national (1000km), ${fallbackBusinesses.length} fallback, ${globalBusinesses.length} global businesses`);
        
        businesses = prioritizedBusinesses;
      }
      
      // Cache results if no filters
      if (!filters) {
        businessCache.data = businesses;
        businessCache.lastFetch = now;
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const result = businesses.slice(startIndex, endIndex);
      
      console.log(`[BusinessService] Fetched businesses from business table:`, { count: result.length });
      return result;
    } catch (error) {
      console.error('[BusinessService] Error in getBusinesses:', error);
      return [];
    }
  }

  /**
   * Get all businesses from ALL tables (no featured filtering - everyone is free)
   * Queries businesses, business, and mosques tables
   */
  static async getFeaturedBusinesses(
    limit: number = 10,
    userLocation?: { lat: number; lng: number }
  ): Promise<BusinessWithDetails[]> {
    // Simply delegate to getBusinesses
    return this.getBusinesses(1, limit, userLocation);
  }

  /**
   * Get business by ID or slug
   * Queries ALL business tables (businesses, business, mosques)
   */
  static async getBusinessById(id: string | number): Promise<BusinessWithDetails | null> {
    try {
      console.log('[BusinessService] Fetching business by ID:', id);
      const idStr = String(id);

      // Helper to normalize a business record
      const normalize = (business: any): BusinessWithDetails => ({
        ...business,
        featured: business.featured || business.is_featured || false,
        is_featured: business.is_featured || business.featured || false,
        latitude: business.latitude || business.lat || null,
        longitude: business.longitude || business.lng || null,
      });

      // First attempt: fetch by ID in all tables (works for UUID or numeric IDs)
      const byIdQueries = [
        supabase.from('businesses').select('*').eq('id', idStr),
        supabase.from('business').select('*').eq('id', idStr),
        supabase.from('business_unified').select('*').eq('id', idStr),
        supabase.from('mosques').select('*').eq('id', idStr),
      ];

      // If id is all digits, also try numeric eq (some tables use integer IDs)
      if (/^\d+$/.test(idStr)) {
        byIdQueries.push(supabase.from('businesses').select('*').eq('id', parseInt(idStr, 10)));
        byIdQueries.push(supabase.from('business').select('*').eq('id', parseInt(idStr, 10)));
        byIdQueries.push(supabase.from('business_unified').select('*').eq('id', parseInt(idStr, 10)));
        byIdQueries.push(supabase.from('mosques').select('*').eq('id', parseInt(idStr, 10)));
      }

      const byIdResults = await Promise.allSettled(byIdQueries);
      for (const r of byIdResults) {
        if (r.status === 'fulfilled') {
          const { data } = r.value as any;
          if (data && data.length > 0) return normalize(data[0]);
        }
      }

      // Second attempt: treat input as slug; some tables might not have slug -> ignore 400s
      const bySlugResults = await Promise.allSettled([
        supabase.from('businesses').select('*').eq('slug', idStr),
        supabase.from('business').select('*').eq('slug', idStr),
        supabase.from('business_unified').select('*').eq('slug', idStr),
        supabase.from('mosques').select('*').eq('slug', idStr),
      ]);
      for (const r of bySlugResults) {
        if (r.status === 'fulfilled') {
          const { data } = r.value as any;
          if (data && data.length > 0) return normalize(data[0]);
        }
      }
      
      return null;
    } catch (error) {
      console.error('[BusinessService] Error in getBusinessById:', error);
      return null;
    }
  }

  /**
   * Search businesses by query
   * Queries ALL business tables (businesses, business, mosques)
   */
  static async searchBusinesses(
    query: string,
    limit: number = 20,
    filters?: EnhancedBusinessFilters
  ): Promise<BusinessWithDetails[]> {
    try {
      console.log('[BusinessService] Searching businesses with query:', query);
      
      const searchQueries = [
        // Query 1: 'businesses' table
        supabase
          .from('businesses')
          .select('*')
          .or(`name.ilike.%${query}%,business_type.ilike.%${query}%,city.ilike.%${query}%`),
        
        // Query 2: 'business' table
        supabase
          .from('business')
          .select('*')
          .or(`name.ilike.%${query}%,business_type.ilike.%${query}%,city.ilike.%${query}%`),
        
        // Query 3: 'business_unified' table
        supabase
          .from('business_unified')
          .select('*')
          .or(`name.ilike.%${query}%,business_type.ilike.%${query}%,city.ilike.%${query}%`),
        
        // Query 4: 'mosques' table
        supabase
          .from('mosques')
          .select('*')
          .or(`name.ilike.%${query}%,category.ilike.%${query}%,city.ilike.%${query}%`)
      ];
      
      const results = await Promise.all(searchQueries);
      
      const businessMap = new Map<string | number, BusinessWithDetails>();
      
      results.forEach((result, index) => {
        const { data, error } = result;
        
        if (error) {
          console.warn(`[BusinessService] Error searching table ${index}:`, error);
          return;
        }
        
        if (data && Array.isArray(data)) {
          data.forEach(business => {
            if (business.id) {
              // Normalize featured/is_featured fields and location fields
              const normalizedBusiness = {
                ...business,
                featured: business.featured || business.is_featured || false,
                is_featured: business.is_featured || business.featured || false,
                // Normalize location field names (some tables use longitude/latitude, others use lng/lat)
                latitude: business.latitude || business.lat || null,
                longitude: business.longitude || business.lng || null
              };
              businessMap.set(business.id, normalizedBusiness);
            }
          });
        }
      });
      
      let businesses = Array.from(businessMap.values()) as BusinessWithDetails[];
      
      // Apply location-based filtering if provided
      if (filters?.latitude && filters?.longitude && filters?.radius_km) {
        businesses = businesses
          .map(business => ({
            ...business,
            distance: this.calculateDistance(
              filters.latitude!,
              filters.longitude!,
              business.latitude || 0,
              business.longitude || 0
            )
          }))
          .filter(business => business.distance <= filters.radius_km!)
          .sort((a, b) => a.distance - b.distance);
      }
      
      console.log(`[BusinessService] Search results:`, { count: businesses.length });
      return businesses;
    } catch (error) {
      console.error('[BusinessService] Error in searchBusinesses:', error);
      return [];
    }
  }

  // Get mosques with coordinate-based filtering (like Google)
  static async getMosques(
    page: number = 1,
    limit: number = 20,
    userLocation?: { lat: number; lng: number }
  ): Promise<BusinessWithDetails[]> {
    try {
      console.log('[BusinessService] Fetching mosques with coordinate filtering');
      
      // Get user location for distance calculation
      const userLat = userLocation?.lat || -31.8705; // Default to Perth
      const userLng = userLocation?.lng || 115.8884;
      const userCity = userLocation?.city || 'Perth';
      
      console.log(`[BusinessService] User coordinates for mosques: ${userLat}, ${userLng} (${userCity})`);
      
      // Query all possible mosque tables with higher limits to get more data
      const queries = [
        supabase.from('mosques').select('*').limit(limit * 10), // 500 * 10 = 5000
        supabase.from('mosque').select('*').limit(limit * 10), // 500 * 10 = 5000  
        supabase.from('mosque_unified').select('*').limit(limit * 20), // 500 * 20 = 10000 (largest table)
        supabase.from('mosques_unified').select('*').limit(limit * 2),
        supabase.from('businesses').select('*').eq('business_type', 'Mosque').limit(limit * 2),
        supabase.from('business').select('*').eq('business_type', 'Mosque').limit(limit * 2),
        supabase.from('business_unified').select('*').eq('business_type', 'Mosque').limit(limit * 2)
      ];
      
      const results = await Promise.all(queries);
      
      // Combine all mosque results with detailed logging
      let allMosques = [];
      const tableNames = ['mosques', 'mosque', 'mosque_unified', 'mosques_unified', 'businesses', 'business', 'business_unified'];
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const tableName = tableNames[i];
        
        if (result.error) {
          console.log(`[BusinessService] Table ${tableName} error:`, result.error.message);
        } else if (result.data && Array.isArray(result.data)) {
          console.log(`[BusinessService] Table ${tableName} returned ${result.data.length} records`);
          allMosques = allMosques.concat(result.data);
        } else {
          console.log(`[BusinessService] Table ${tableName} returned no data`);
        }
      }
      
      console.log(`[BusinessService] Total mosques found across all tables: ${allMosques.length}`);
      
      // If no mosques found, try a direct query to mosques table as fallback
      if (allMosques.length === 0) {
        console.log('[BusinessService] No mosques found in any table, trying direct mosques table query...');
        try {
          const { data: directMosques, error: directError } = await supabase
            .from('mosques')
            .select('*')
            .limit(100);
          
          if (directError) {
            console.log('[BusinessService] Direct mosques query error:', directError.message);
          } else if (directMosques && directMosques.length > 0) {
            console.log(`[BusinessService] Direct mosques query found ${directMosques.length} records`);
            allMosques = directMosques;
          }
        } catch (fallbackError) {
          console.log('[BusinessService] Direct mosques query failed:', fallbackError);
        }
      }
      
      // Calculate distance and filter by proximity
      const mosquesWithDistance = allMosques.map(mosque => {
        // Handle different coordinate field names across tables
        // mosque_unified uses lat/lng, mosques uses latitude/longitude
        const mosqueLat = mosque.latitude || mosque.lat || 0;
        const mosqueLng = mosque.longitude || mosque.lng || 0;
        
        if (mosqueLat === 0 || mosqueLng === 0) {
          return {
            ...mosque,
            distance: Infinity
          };
        }
        
        const distance = calculateDistance(userLat, userLng, mosqueLat, mosqueLng);
        
        // Debug logging for first few mosques
        if (allMosques.indexOf(mosque) < 5) {
          console.log(`[BusinessService] Mosque ${mosque.name}: lat=${mosqueLat}, lng=${mosqueLng}, distance=${distance.toFixed(2)}km`);
        }
        
        // Log any mosques with valid coordinates but very far distances
        if (mosqueLat !== 0 && mosqueLng !== 0 && distance > 10000) {
          console.log(`[BusinessService] Far mosque: ${mosque.name} in ${mosque.city}, ${mosque.country} - ${distance.toFixed(2)}km away`);
        }
        
        return {
          ...mosque,
          distance: distance,
          latitude: mosqueLat,
          longitude: mosqueLng
        };
      });
      
      // COORDINATE-BASED PRIMARY SEARCH for mosques with broader filter fallback
      console.log('[BusinessService] COORDINATE-BASED: Using coordinates as primary for mosques, broadening filter');
      
      // 1. PRIMARY: Mosques with coordinates within 100km (more lenient)
      const localMosques = mosquesWithDistance.filter(mosque => mosque.distance <= 100);
      
      // 2. SECONDARY: Mosques with coordinates within 500km
      const regionalMosques = mosquesWithDistance.filter(mosque => 
        mosque.distance > 100 && mosque.distance <= 500
      );
      
      // 3. TERTIARY: Mosques with coordinates within 2000km (much more lenient)
      const nationalMosques = mosquesWithDistance.filter(mosque => 
        mosque.distance > 500 && mosque.distance <= 2000
      );
      
      // 4. FALLBACK: Mosques without coordinates, filtered by city/state
      const fallbackMosques = mosquesWithDistance.filter(mosque => {
        const mosqueLat = mosque.latitude || mosque.lat || 0;
        const mosqueLng = mosque.longitude || mosque.lng || 0;
        const noCoordinates = mosqueLat === 0 || mosqueLng === 0 || mosque.distance === Infinity;
        const matchesCity = mosque.city?.toLowerCase().includes(userCity.toLowerCase());
        const matchesState = mosque.state?.toLowerCase().includes('western australia');
        const matchesCountry = mosque.country?.toLowerCase().includes('australia');
        
        return noCoordinates && (matchesCity || matchesState || matchesCountry);
      });
      
      // 5. GLOBAL: All other mosques (including far ones, but sorted by distance)
      const globalMosques = mosquesWithDistance.filter(mosque => {
        const mosqueLat = mosque.latitude || mosque.lat || 0;
        const mosqueLng = mosque.longitude || mosque.lng || 0;
        const noCoordinates = mosqueLat === 0 || mosqueLng === 0 || mosque.distance === Infinity;
        const matchesCity = mosque.city?.toLowerCase().includes(userCity.toLowerCase());
        const matchesState = mosque.state?.toLowerCase().includes('western australia');
        
        return noCoordinates && !matchesCity && !matchesState;
      });
      
      // 6. AUSTRALIAN: Australian mosques beyond 2000km (prioritize over international)
      const australianMosques = mosquesWithDistance.filter(mosque => {
        const matchesCountry = mosque.country?.toLowerCase().includes('australia');
        const matchesCity = mosque.city?.toLowerCase().includes('sydney') || 
                           mosque.city?.toLowerCase().includes('melbourne') || 
                           mosque.city?.toLowerCase().includes('brisbane');
        return mosque.distance > 2000 && (matchesCountry || matchesCity);
      });
      
      // 7. DISTANT: All other mosques with coordinates but beyond 2000km (sorted by distance)
      const distantMosques = mosquesWithDistance.filter(mosque => {
        const matchesCountry = mosque.country?.toLowerCase().includes('australia');
        const matchesCity = mosque.city?.toLowerCase().includes('sydney') || 
                           mosque.city?.toLowerCase().includes('melbourne') || 
                           mosque.city?.toLowerCase().includes('brisbane');
        return mosque.distance > 2000 && !matchesCountry && !matchesCity;
      });
      
      // Combine with priority: local → regional → national → fallback → australian → global → distant
      const prioritizedMosques = [
        ...localMosques,
        ...regionalMosques,
        ...nationalMosques,
        ...fallbackMosques,
        ...australianMosques,
        ...globalMosques,
        ...distantMosques
      ];
      
      console.log(`[BusinessService] Found ${localMosques.length} local (100km), ${regionalMosques.length} regional (500km), ${nationalMosques.length} national (2000km), ${fallbackMosques.length} fallback, ${australianMosques.length} Australian, ${globalMosques.length} global, ${distantMosques.length} distant mosques`);
      
      return prioritizedMosques.slice(0, limit);
    } catch (error) {
      console.error('[BusinessService] Error fetching mosques:', error);
      return [];
    }
  }
}
