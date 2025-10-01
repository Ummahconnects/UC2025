
import { supabase } from '@/lib/supabase-client';

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export class MosqueService {
  static async getMosques(
    page: number = 1,
    limit: number = 50,
    userLocation?: MosqueLocation
  ): Promise<MosqueData[]> {
    try {
      console.log('[MosqueService] Fetching mosques with location filtering');

      // Use the unified view for consistent data
      console.log('[MosqueService] Using accessible_mosque_locations view');

      const { data, error } = await supabase
        .from('accessible_mosque_locations')
        .select('*')
        .limit(limit * 2);

      if (error) {
        console.log('[MosqueService] Unified view error:', error.message);
        return [];
      }

      let allMosques = data || [];
      console.log(`[MosqueService] Unified view returned ${allMosques.length} records`);

      console.log(`[MosqueService] Total mosques found: ${allMosques.length}`);

      // Location-based filtering
      if (userLocation && userLocation.lat && userLocation.lng) {
        const userLat = userLocation.lat;
        const userLng = userLocation.lng;

        const mosquesWithDistance = allMosques.map(mosque => {
          const mosqueLat = mosque.latitude || 0;
          const mosqueLng = mosque.longitude || 0;

          if (mosqueLat === 0 || mosqueLng === 0) {
            return { ...mosque, distance: Infinity };
          }

          const distance = calculateDistance(userLat, userLng, mosqueLat, mosqueLng);

          return {
            ...mosque,
            distance: distance
          };
        }).filter(mosque => mosque.distance !== Infinity);

        const sortedByDistance = mosquesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

        console.log(`[MosqueService] Found ${sortedByDistance.length} mosques with valid coordinates`);
        console.log(`[MosqueService] Returning top ${limit} closest mosques`);
        return sortedByDistance.slice(0, limit);
      }

      // No location - return all mosques
      return allMosques.slice(0, limit);

    } catch (error) {
      console.error('[MosqueService] Error fetching mosques:', error);
      return [];
    }
  }
}
