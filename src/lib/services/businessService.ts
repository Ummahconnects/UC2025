import { supabaseClient as supabase } from '@/lib/supabaseClient';

type NormalizedBusiness = {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
  rating?: number;
  reviews_count?: number;
  business_type?: string;
  business_category?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  featured?: boolean;
  is_featured?: boolean;
  location?: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
};

function normalize(row: any): NormalizedBusiness {
  // Ensure we have proper address and location data
  const address = row.address || row.street_address || row.full_address || '';
  const city = row.city || row.locality || '';
  const state = row.state || row.province || row.region || '';
  const country = row.country || '';
  const phone = row.phone || row.contact_phone || row.phone_number || '';
  
  // Create a proper location string
  const locationParts = [city, state, country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
  
  return {
    id: row.id,
    name: row.name || row.business_name || 'Business',
    description: row.description || row.short_description || undefined,
    image: row.image || row.featured_image || row.cover_image || row.logo || row.thumbnail_url || undefined,
    rating: Number(row.rating ?? row.stars ?? 0) || undefined,
    reviews_count: Number(row.reviews_count ?? row.review_count ?? 0) || undefined,
    business_type: row.business_type || row.category || 'Business',
    business_category: row.business_category || row.category || undefined,
    address: address,
    city: city,
    state: state,
    country: country,
    phone: phone,
    featured: Boolean(row.featured),
    is_featured: Boolean(row.is_featured),
    location: location,
    distance: row.distance || undefined,
    latitude: typeof row.latitude === 'number' ? row.latitude : (typeof row.lat === 'number' ? row.lat : undefined),
    longitude: typeof row.longitude === 'number' ? row.longitude : (typeof row.lng === 'number' ? row.lng : undefined),
  };
}

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

export const BusinessService = { 
  async getBusinesses(page: number = 1, limit: number = 20, location?: any) {
    try {
      console.log('[BusinessService] Fetching businesses from ALL tables with location:', location);
      
      const offset = (page - 1) * limit;
      // Pull from all three sources with higher limit for location filtering
      const [businesses, business, unified] = await Promise.all([
        supabase.from('businesses').select('*').order('is_featured', { ascending: false }).limit(5000),
        supabase.from('business').select('*').order('is_featured', { ascending: false }).limit(5000),
        supabase.from('business_unified').select('*').limit(5000),
      ]);

      const rows: any[] = [];
      if (businesses.data) rows.push(...businesses.data.map(normalize));
      if (business.data) rows.push(...business.data.map(normalize));
      if (unified.data) rows.push(...unified.data.map(normalize));

      console.log(`[BusinessService] Total businesses from all tables: ${rows.length}`);

      // Apply location-based filtering BEFORE de-duplication - STRICT MODE
      let filteredRows = rows;
      if (location?.lat && location?.lng) {
        const userLat = location.lat;
        const userLng = location.lng;
        
        console.log(`[BusinessService] STRICT LOCATION FILTERING: ${userLat}, ${userLng}`);
        
        // Calculate distance for each business and filter within 50km for stricter filtering
        filteredRows = rows.map(business => {
          const businessLat = business.latitude || 0;
          const businessLng = business.longitude || 0;
          
          if (businessLat === 0 || businessLng === 0) {
            return null; // Skip businesses without coordinates
          }
          
          const distanceKm = calculateDistance(userLat, userLng, businessLat, businessLng);
          
          return {
            ...business,
            distance: `${distanceKm.toFixed(1)} km`,
            distanceNum: distanceKm
          };
        }).filter((b): b is NonNullable<typeof b> => 
          b !== null && b.distanceNum !== undefined && b.distanceNum <= 50 // ONLY within 50km
        );
        
        console.log(`[BusinessService] STRICT FILTER: Found ${filteredRows.length} businesses within 50km`);
        console.log(`[BusinessService] First 5 businesses:`, filteredRows.slice(0, 5).map(b => ({
          name: b.name,
          distance: b.distance,
          city: b.city
        })));
      } else {
        // No location provided - use default Perth coordinates
        console.warn(`[BusinessService] ⚠️ NO LOCATION PROVIDED! Using default Perth coordinates`);
        const perthLat = -31.9505;
        const perthLng = 115.8605;
        
        filteredRows = rows.map(business => {
          const businessLat = business.latitude || 0;
          const businessLng = business.longitude || 0;
          
          if (businessLat === 0 || businessLng === 0) {
            return null;
          }
          
          const distanceKm = calculateDistance(perthLat, perthLng, businessLat, businessLng);
          
          return {
            ...business,
            distance: `${distanceKm.toFixed(1)} km`,
            distanceNum: distanceKm
          };
        }).filter((b): b is NonNullable<typeof b> => 
          b !== null && b.distanceNum !== undefined && b.distanceNum <= 50
        );
        
        console.log(`[BusinessService] Using default Perth location, found ${filteredRows.length} businesses within 50km`);
      }

      // De-duplicate by name + city (ids differ across tables)
      const seen = new Set<string>();
      const merged = filteredRows.filter((r) => {
        const key = `${(r.name || '').toLowerCase()}|${(r.city || '').toLowerCase()}|${r.phone || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Prioritize distance (if available), then featured, then rating, then reviews count
      merged.sort((a, b) => {
        // First sort by distance if both have it
        if (a.distanceNum !== undefined && b.distanceNum !== undefined) {
          if (a.distanceNum !== b.distanceNum) return a.distanceNum - b.distanceNum;
        }
        
        const fA = (a.is_featured ? 2 : 0) + (a.featured ? 1 : 0);
        const fB = (b.is_featured ? 2 : 0) + (b.featured ? 1 : 0);
        if (fA !== fB) return fB - fA;
        const rA = a.rating || 0;
        const rB = b.rating || 0;
        if (rA !== rB) return rB - rA;
        const rcA = a.reviews_count || 0;
        const rcB = b.reviews_count || 0;
        return rcB - rcA;
      });

      console.log(`[BusinessService] Returning ${merged.slice(offset, offset + limit).length} businesses`);
      return merged.slice(offset, offset + limit);
    } catch (error) {
      console.error('[BusinessService] Error fetching businesses:', error);
      return [];
    }
  },

  async getBusinessById(id: string) {
    // Try by id in each table
    const tryFetch = async (table: string) => {
      const { data } = await supabase.from(table).select('*').eq('id', id).single();
      return data ? normalize(data) : null;
    };
    const byId = (await tryFetch('businesses')) || (await tryFetch('business')) || (await tryFetch('business_unified'));
    if (byId) return byId;

    // If not UUID/integer match, try by slug or name
    const { data: likeData } = await supabase
      .from('businesses')
      .select('*')
      .ilike('name', `%${id}%`)
      .limit(1);
    if (likeData && likeData[0]) return normalize(likeData[0]);
    throw new Error('Business not found');
  },

  async searchBusinesses(query: string, location?: any) {
    const [a, b, c] = await Promise.all([
      supabase.from('businesses').select('*').ilike('name', `%${query}%`).limit(50),
      supabase.from('business').select('*').ilike('name', `%${query}%`).limit(50),
      supabase.from('business_unified').select('*').ilike('name', `%${query}%`).limit(50),
    ]);
    const rows: any[] = [];
    if (a.data) rows.push(...a.data.map(normalize));
    if (b.data) rows.push(...b.data.map(normalize));
    if (c.data) rows.push(...c.data.map(normalize));
    // De-dupe
    const seen = new Set<string>();
    const merged = rows.filter((r) => {
      const key = `${(r.name || '').toLowerCase()}|${(r.city || '').toLowerCase()}|${r.phone || ''}`;
      if (seen.has(key)) return false; seen.add(key); return true;
    });
    return merged.slice(0, 50);
  }
};
