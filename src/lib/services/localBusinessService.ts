import type { BusinessWithDetails } from '@/types/business';

// Sample business data from CSV
const sampleBusinesses: BusinessWithDetails[] = [
  {
    id: 1,
    name: "Halal Delights Restaurant",
    slug: "halal-delights",
    business_type: "Restaurant",
    business_category: "Food & Dining",
    address: "123 Main Street",
    city: "Perth",
    country: "Australia",
    postal_code: "6000",
    latitude: -31.9523,
    longitude: 115.8613,
    phone: "+61812345678",
    email: "contact@halaldelights.com",
    website: "https://halaldelights.com",
    image: "/images/Halal-Delights.jpg",
    description: "Authentic halal restaurant serving a variety of cuisines",
    short_description: "Authentic halal cuisine",
    rating: 4.5,
    reviews_count: 42,
    verified_count: 15,
    total_views: 1200,
    is_featured: true,
    is_verified: true,
    is_premium: false,
    status: "active",
    membership_type: "standard",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Global Islamic Finance",
    slug: "global-islamic-finance",
    business_type: "Financial Services",
    business_category: "Finance",
    address: "456 Business Avenue",
    city: "Perth",
    country: "Australia",
    postal_code: "6000",
    latitude: -31.9583,
    longitude: 115.8733,
    phone: "+61823456789",
    email: "info@globalislamic.finance",
    website: "https://globalislamic.finance",
    image: "/images/GlobalBusiness.jpg",
    description: "Islamic banking and finance solutions for individuals and businesses",
    short_description: "Shariah-compliant financial services",
    rating: 4.8,
    reviews_count: 36,
    verified_count: 22,
    total_views: 980,
    is_featured: true,
    is_verified: true,
    is_premium: true,
    status: "active",
    membership_type: "premium",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 3,
    name: "Al-Noor Education Center",
    slug: "al-noor-education",
    business_type: "Education",
    business_category: "Education",
    address: "789 Learning Street",
    city: "Sydney",
    country: "Australia",
    postal_code: "2000",
    latitude: -33.8688,
    longitude: 151.2093,
    phone: "+61234567890",
    email: "info@alnoor.edu.au",
    website: "https://alnoor.edu.au",
    image: "/images/AlNoorEducation.jpg",
    description: "Islamic education center offering Quran classes, Arabic lessons, and Islamic studies",
    short_description: "Islamic education and Quran classes",
    rating: 4.9,
    reviews_count: 58,
    verified_count: 45,
    total_views: 1500,
    is_featured: true,
    is_verified: true,
    is_premium: false,
    status: "active",
    membership_type: "standard",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 4,
    name: "Muslim Healthcare Clinic",
    slug: "muslim-healthcare-clinic",
    business_type: "Healthcare",
    business_category: "Healthcare",
    address: "321 Health Avenue",
    city: "Brisbane",
    country: "Australia",
    postal_code: "4000",
    latitude: -27.4698,
    longitude: 153.0251,
    phone: "+61734567890",
    email: "info@muslimhealthcare.com.au",
    website: "https://muslimhealthcare.com.au",
    image: "/images/MuslimHealthcare.jpg",
    description: "Muslim-friendly healthcare services with cultural sensitivity and halal medication options",
    short_description: "Muslim-friendly healthcare services",
    rating: 4.7,
    reviews_count: 89,
    verified_count: 67,
    total_views: 2100,
    is_featured: true,
    is_verified: true,
    is_premium: true,
    status: "active",
    membership_type: "premium",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 5,
    name: "Halal Market",
    slug: "halal-market",
    business_type: "Grocery",
    business_category: "Food & Dining",
    address: "654 Market Street",
    city: "Melbourne",
    country: "Australia",
    postal_code: "3000",
    latitude: -37.8136,
    longitude: 144.9631,
    phone: "+61345678901",
    email: "info@halalmarket.com.au",
    website: "https://halalmarket.com.au",
    image: "/images/HalalMarket.jpg",
    description: "Premium halal grocery store with fresh produce and imported goods",
    short_description: "Premium halal grocery store",
    rating: 4.6,
    reviews_count: 73,
    verified_count: 52,
    total_views: 1800,
    is_featured: true,
    is_verified: true,
    is_premium: false,
    status: "active",
    membership_type: "standard",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 6,
    name: "Modest Elegance",
    slug: "modest-elegance",
    business_type: "Clothing",
    business_category: "Fashion",
    address: "987 Fashion Boulevard",
    city: "Brisbane",
    country: "Australia",
    postal_code: "4000",
    latitude: -27.4698,
    longitude: 153.0251,
    phone: "+61745678901",
    email: "info@modestelegance.com.au",
    website: "https://modestelegance.com.au",
    image: "/images/ModestElegance.jpg",
    description: "Modest fashion for the modern Muslim woman",
    short_description: "Modest fashion for modern Muslims",
    rating: 4.8,
    reviews_count: 94,
    verified_count: 78,
    total_views: 2200,
    is_featured: true,
    is_verified: true,
    is_premium: true,
    status: "active",
    membership_type: "premium",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 7,
    name: "Islamic Travel Agency",
    slug: "islamic-travel-agency",
    business_type: "Travel",
    business_category: "Travel & Tourism",
    address: "147 Travel Lane",
    city: "Sydney",
    country: "Australia",
    postal_code: "2000",
    latitude: -33.8688,
    longitude: 151.2093,
    phone: "+61245678901",
    email: "info@islamictravel.com.au",
    website: "https://islamictravel.com.au",
    image: "/images/IslamicTravel.jpg",
    description: "Hajj, Umrah, and halal tourism services with experienced guides",
    short_description: "Hajj, Umrah, and halal tourism",
    rating: 4.9,
    reviews_count: 156,
    verified_count: 134,
    total_views: 3200,
    is_featured: true,
    is_verified: true,
    is_premium: true,
    status: "active",
    membership_type: "premium",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 8,
    name: "Muslim Wedding Services",
    slug: "muslim-wedding-services",
    business_type: "Wedding Services",
    business_category: "Events",
    address: "258 Celebration Court",
    city: "Perth",
    country: "Australia",
    postal_code: "6000",
    latitude: -31.9523,
    longitude: 115.8613,
    phone: "+61845678901",
    email: "info@muslimweddings.com.au",
    website: "https://muslimweddings.com.au",
    image: "/images/MuslimWeddings.jpg",
    description: "Complete Muslim wedding planning and ceremony services",
    short_description: "Muslim wedding planning and ceremonies",
    rating: 4.7,
    reviews_count: 67,
    verified_count: 45,
    total_views: 1400,
    is_featured: true,
    is_verified: true,
    is_premium: false,
    status: "active",
    membership_type: "standard",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  }
];

export interface BusinessFilters {
  business_type?: string;
  city?: string;
  country?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  website?: string;
  owner_id?: string;
}

export class LocalBusinessService {
  static async getBusinesses(
    page: number = 1,
    limit: number = 1000,
    filters?: BusinessFilters
  ): Promise<BusinessWithDetails[]> {
    try {
      console.log('[LocalBusinessService] Fetching businesses from local data', { page, limit, filters });
      
      let filteredBusinesses = [...sampleBusinesses];

      // Apply filters
      if (filters) {
        if (filters.business_type) {
          filteredBusinesses = filteredBusinesses.filter(b => 
            b.business_type?.toLowerCase().includes(filters.business_type!.toLowerCase())
          );
        }
        if (filters.city) {
          filteredBusinesses = filteredBusinesses.filter(b => 
            b.city?.toLowerCase().includes(filters.city!.toLowerCase())
          );
        }
        if (filters.country) {
          filteredBusinesses = filteredBusinesses.filter(b => 
            b.country?.toLowerCase().includes(filters.country!.toLowerCase())
          );
        }
        if (filters.rating) {
          filteredBusinesses = filteredBusinesses.filter(b => 
            b.rating >= filters.rating!
          );
        }
        if (filters.website) {
          filteredBusinesses = filteredBusinesses.filter(b => 
            b.website && b.website.length > 0
          );
        }
      }

      // Apply pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedBusinesses = filteredBusinesses.slice(start, end);

      console.log('[LocalBusinessService] Fetched businesses:', { count: paginatedBusinesses.length });
      return paginatedBusinesses;
    } catch (err) {
      console.error('[LocalBusinessService] Error fetching businesses:', err);
      throw err;
    }
  }

  static async getFeaturedBusinesses(limit = 6): Promise<BusinessWithDetails[]> {
    try {
      console.log('[LocalBusinessService] Fetching featured businesses with limit:', limit);
      
      const featuredBusinesses = sampleBusinesses
        .filter(b => b.is_featured)
        .slice(0, limit);

      console.log('[LocalBusinessService] Fetched featured businesses:', { count: featuredBusinesses.length });
      return featuredBusinesses;
    } catch (error) {
      console.error('[LocalBusinessService] Error in getFeaturedBusinesses:', error);
      throw error;
    }
  }

  static async getBusinessById(id: string): Promise<BusinessWithDetails | null> {
    try {
      const business = sampleBusinesses.find(b => b.id === parseInt(id, 10));
      return business || null;
    } catch (error) {
      console.error('[LocalBusinessService] Error in getBusinessById:', error);
      throw error;
    }
  }
}







