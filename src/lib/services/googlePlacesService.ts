import { logger } from '../errors/Logger';

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    relative_time_description: string;
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface GooglePlacesResponse {
  result: GooglePlaceDetails;
  status: string;
}

export class GooglePlacesService {
  private static readonly API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
  private static readonly BASE_URL = 'https://maps.googleapis.com/maps/api/place';

  /**
   * Search for a place by name and location
   */
  static async searchPlace(businessName: string, address?: string, city?: string): Promise<string | null> {
    try {
      if (!this.API_KEY) {
        console.warn('⚠️ Google Places API key not found');
        return null;
      }

      const query = `${businessName} ${address || ''} ${city || ''}`.trim();
      console.log(`🔍 [GooglePlaces] Searching for: "${query}"`);

      const url = `${this.BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const placeId = data.results[0].place_id;
        console.log(`✅ [GooglePlaces] Found place ID: ${placeId}`);
        return placeId;
      }

      console.log(`❌ [GooglePlaces] No results found for: "${query}"`);
      return null;
    } catch (error) {
      console.error('❌ [GooglePlaces] Error searching place:', error);
      logger.error('Google Places search failed', { error, businessName, address, city });
      return null;
    }
  }

  /**
   * Get detailed place information including reviews
   */
  static async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      if (!this.API_KEY) {
        console.warn('⚠️ Google Places API key not found');
        return null;
      }

      const fields = 'place_id,name,rating,user_ratings_total,reviews,formatted_address,geometry';
      const url = `${this.BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${this.API_KEY}`;
      
      const response = await fetch(url);
      const data: GooglePlacesResponse = await response.json();

      if (data.status === 'OK' && data.result) {
        console.log(`✅ [GooglePlaces] Retrieved details for: ${data.result.name}`);
        return data.result;
      }

      console.log(`❌ [GooglePlaces] Failed to get details for place ID: ${placeId}`);
      return null;
    } catch (error) {
      console.error('❌ [GooglePlaces] Error getting place details:', error);
      logger.error('Google Places details failed', { error, placeId });
      return null;
    }
  }

  /**
   * Get business rating and reviews from Google Places
   */
  static async getBusinessRating(businessName: string, address?: string, city?: string): Promise<{
    rating: number;
    reviewCount: number;
    reviews: Array<{
      author: string;
      rating: number;
      text: string;
      time: string;
    }>;
    placeId?: string;
  } | null> {
    try {
      console.log(`🌟 [GooglePlaces] Getting rating for: ${businessName}`);

      // First, search for the place
      const placeId = await this.searchPlace(businessName, address, city);
      if (!placeId) {
        return null;
      }

      // Get detailed information
      const details = await this.getPlaceDetails(placeId);
      if (!details) {
        return null;
      }

      const result = {
        rating: details.rating || 0,
        reviewCount: details.user_ratings_total || 0,
        reviews: (details.reviews || []).map(review => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.relative_time_description
        })),
        placeId: details.place_id
      };

      console.log(`✅ [GooglePlaces] Found rating: ${result.rating}/5 (${result.reviewCount} reviews)`);
      return result;
    } catch (error) {
      console.error('❌ [GooglePlaces] Error getting business rating:', error);
      logger.error('Google Places rating failed', { error, businessName, address, city });
      return null;
    }
  }

  /**
   * Batch process multiple businesses
   */
  static async getBatchRatings(businesses: Array<{
    name: string;
    address?: string;
    city?: string;
  }>): Promise<Map<string, any>> {
    const results = new Map();
    
    console.log(`🔄 [GooglePlaces] Processing ${businesses.length} businesses...`);
    
    for (const business of businesses) {
      try {
        const rating = await this.getBusinessRating(business.name, business.address, business.city);
        if (rating) {
          results.set(business.name, rating);
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ [GooglePlaces] Error processing ${business.name}:`, error);
      }
    }
    
    console.log(`✅ [GooglePlaces] Processed ${results.size}/${businesses.length} businesses`);
    return results;
  }
}
