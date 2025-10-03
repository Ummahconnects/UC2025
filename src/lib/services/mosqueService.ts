import { supabaseClient as supabase } from '@/lib/supabaseClient';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const MosqueService = { 
  async getMosques(page: number = 1, limit: number = 20, location?: any) {
    try {
      console.log('[MosqueService] Fetching mosques from ALL tables', { page, limit, location });
      
      // Query ALL mosque tables to get complete data
      const tables = ['mosques', 'mosque', 'mosque_unified', 'businesses'];
      let allMosques: any[] = [];
      
      for (const table of tables) {
        try {
          console.log(`[MosqueService] Querying table: ${table}`);
          
          let query = supabase.from(table).select('*');
          
          // For businesses table, filter by mosque type
          if (table === 'businesses') {
            query = query.or('business_type.eq.Mosque,business_type.eq.mosque,business_type.ilike.%mosque%');
          }
          
          const { data, error } = await query.limit(5000); // Get more records initially
          
          if (error) {
            console.log(`[MosqueService] Table ${table} error:`, error.message);
            continue;
          }
          
          if (data && data.length > 0) {
            console.log(`[MosqueService] Table ${table} returned ${data.length} records`);
            allMosques = [...allMosques, ...data.map(m => ({ ...m, source_table: table }))];
          }
        } catch (tableError) {
          console.log(`[MosqueService] Table ${table} failed:`, tableError);
        }
      }
      
      console.log(`[MosqueService] Total mosques from all tables: ${allMosques.length}`);
      
      // Apply location-based filtering - STRICT MODE
      if (location?.lat && location?.lng) {
        const userLat = location.lat;
        const userLng = location.lng;
        
        console.log(`[MosqueService] STRICT LOCATION FILTERING: ${userLat}, ${userLng}`);
        
        // Calculate distance for each mosque
        const mosquesWithDistance = allMosques.map(mosque => {
          // Handle different coordinate field names
          const mosqueLat = mosque.latitude || mosque.lat || 0;
          const mosqueLng = mosque.longitude || mosque.lng || 0;
          
          if (mosqueLat === 0 || mosqueLng === 0) {
            return null; // Skip mosques without coordinates
          }
          
          const distance = calculateDistance(userLat, userLng, mosqueLat, mosqueLng);
          
          return {
            ...mosque,
            distance: distance,
            latitude: mosqueLat,
            longitude: mosqueLng
          };
        }).filter((mosque): mosque is NonNullable<typeof mosque> => 
          mosque !== null && mosque.distance <= 50 // ONLY show within 50km for stricter filtering
        );
        
        // Sort by distance
        const sortedByDistance = mosquesWithDistance.sort((a, b) => a.distance - b.distance);
        
        console.log(`[MosqueService] STRICT FILTER: Found ${sortedByDistance.length} mosques within 50km`);
        console.log(`[MosqueService] First 5 mosques:`, sortedByDistance.slice(0, 5).map(m => ({
          name: m.name,
          distance: m.distance?.toFixed(2) + 'km',
          city: m.city,
          lat: m.latitude,
          lng: m.longitude
        })));
        
        return sortedByDistance.slice(0, limit);
      }
      
      // No location available - use default Perth coordinates
      console.warn(`[MosqueService] ⚠️ NO LOCATION PROVIDED! Using default Perth coordinates`);
      const perthLat = -31.9505;
      const perthLng = 115.8605;
      
      const mosquesWithDistance = allMosques.map(mosque => {
        const mosqueLat = mosque.latitude || mosque.lat || 0;
        const mosqueLng = mosque.longitude || mosque.lng || 0;
        
        if (mosqueLat === 0 || mosqueLng === 0) {
          return null;
        }
        
        const distance = calculateDistance(perthLat, perthLng, mosqueLat, mosqueLng);
        
        return {
          ...mosque,
          distance: distance,
          latitude: mosqueLat,
          longitude: mosqueLng
        };
      }).filter((mosque): mosque is NonNullable<typeof mosque> => 
        mosque !== null && mosque.distance <= 50
      );
      
      const sortedByDistance = mosquesWithDistance.sort((a, b) => a.distance - b.distance);
      console.log(`[MosqueService] Using default Perth location, found ${sortedByDistance.length} mosques within 50km`);
      
      return sortedByDistance.slice(0, limit);
    } catch (error) {
      console.error('[MosqueService] Error fetching mosques:', error);
      return [];
    }
  },

  async getMosqueById(id: string) {
    try {
      console.log('[MosqueService] Fetching mosque by ID from ALL tables:', id);
      
      // Try all mosque tables
      const tables = ['mosques', 'mosque', 'mosque_unified', 'businesses'];
      
      for (const table of tables) {
        try {
          console.log(`[MosqueService] Searching in table: ${table}`);
          
          // Try to find by ID first
          let { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

          // If not found by ID, try by slug
          if (error && error.code === 'PGRST116') {
            console.log(`[MosqueService] Not found by ID in ${table}, trying by slug`);
            const result = await supabase
              .from(table)
              .select('*')
              .eq('slug', id)
              .single();
            data = result.data;
            error = result.error;
          }

          // If found, return it
          if (!error && data) {
            console.log(`[MosqueService] Found mosque in ${table}:`, data.name);
            return { ...data, source_table: table };
          }
        } catch (tableError) {
          console.log(`[MosqueService] Table ${table} search failed, trying next...`);
        }
      }
      
      // Not found in any table
      console.error('[MosqueService] Mosque not found in any table');
      throw new Error('Mosque not found');
    } catch (error) {
      console.error('[MosqueService] Error fetching mosque by ID:', error);
      throw error;
    }
  },

  async searchMosques(query: string, location?: any) {
    try {
      console.log('[MosqueService] Searching mosques in ALL tables:', query);
      
      const tables = ['mosques', 'mosque', 'mosque_unified', 'businesses'];
      let allResults: any[] = [];
      
      for (const table of tables) {
        try {
          let searchQuery = supabase
            .from(table)
            .select('*')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
            .limit(100);
            
          // For businesses table, also filter by mosque type
          if (table === 'businesses') {
            searchQuery = searchQuery.or('business_type.eq.Mosque,business_type.eq.mosque,business_type.ilike.%mosque%');
          }
          
          const { data, error } = await searchQuery;

          if (!error && data && data.length > 0) {
            console.log(`[MosqueService] Found ${data.length} results in ${table}`);
            allResults = [...allResults, ...data.map(m => ({ ...m, source_table: table }))];
          }
        } catch (tableError) {
          console.log(`[MosqueService] Search in ${table} failed`);
        }
      }

      console.log('[MosqueService] Total search results:', allResults.length);
      return allResults.slice(0, 20);
    } catch (error) {
      console.error('[MosqueService] Error searching mosques:', error);
      return [];
    }
  }
};
