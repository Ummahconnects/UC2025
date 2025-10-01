// Business Service Booking System for Ummah Connects
// Multi-vendor marketplace with payment integration

export interface ServiceProvider {
  id: string;
  name: string;
  businessName: string;
  category: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  services: Service[];
  pricing: {
    basePrice: number;
    currency: string;
    commissionRate: number; // Platform commission (5-15%)
  };
  verification: {
    isVerified: boolean;
    mosqueEndorsement?: string;
    halalCertification?: string;
    communityReferences: number;
  };
  rating: {
    average: number;
    totalReviews: number;
  };
  availability: {
    workingHours: WorkingHours[];
    timezone: string;
  };
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // in minutes
  price: number;
  currency: string;
  isAvailable: boolean;
  requirements: string[];
  deliverables: string[];
  images: string[];
}

export interface WorkingHours {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingRequest {
  id: string;
  clientId: string;
  serviceProviderId: string;
  serviceId: string;
  requestedDate: Date;
  requestedTime: string;
  duration: number;
  specialRequirements?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: number;
  commissionAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  preferences: {
    preferredLanguage: string;
    halalRequirements: string[];
    serviceCategories: string[];
  };
  bookingHistory: BookingRequest[];
  createdAt: Date;
}

// Service Categories for Islamic Business Directory
export const SERVICE_CATEGORIES = [
  {
    id: 'islamic-education',
    name: 'Islamic Education',
    description: 'Quran classes, Arabic lessons, Islamic studies',
    icon: '📚',
    subcategories: ['Quran Memorization', 'Arabic Language', 'Islamic Studies', 'Tajweed', 'Hadith Studies']
  },
  {
    id: 'halal-catering',
    name: 'Halal Catering',
    description: 'Halal food services and catering',
    icon: '🍽️',
    subcategories: ['Wedding Catering', 'Event Catering', 'Meal Prep', 'Restaurant Services']
  },
  {
    id: 'islamic-finance',
    name: 'Islamic Finance',
    description: 'Sharia-compliant financial services',
    icon: '💰',
    subcategories: ['Islamic Banking', 'Investment Advisory', 'Zakat Calculation', 'Halal Insurance']
  },
  {
    id: 'muslim-healthcare',
    name: 'Muslim Healthcare',
    description: 'Muslim-friendly healthcare providers',
    icon: '🏥',
    subcategories: ['General Practice', 'Mental Health', 'Women\'s Health', 'Pediatrics']
  },
  {
    id: 'islamic-travel',
    name: 'Islamic Travel',
    description: 'Halal travel and tourism services',
    icon: '✈️',
    subcategories: ['Hajj & Umrah', 'Halal Hotels', 'Muslim Tours', 'Travel Planning']
  },
  {
    id: 'wedding-services',
    name: 'Muslim Wedding Services',
    description: 'Wedding planning and Islamic ceremonies',
    icon: '💒',
    subcategories: ['Wedding Planning', 'Nikah Services', 'Photography', 'Venue Booking']
  },
  {
    id: 'business-consulting',
    name: 'Islamic Business Consulting',
    description: 'Halal business development and consulting',
    icon: '💼',
    subcategories: ['Business Planning', 'Halal Certification', 'Marketing', 'Legal Services']
  }
];

// Payment Integration
export interface PaymentDetails {
  amount: number;
  currency: string;
  serviceProviderId: string;
  clientId: string;
  bookingId: string;
  commissionAmount: number;
  platformFee: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

// Business Booking Service
export class BusinessBookingService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Get service providers by category and location
  async getServiceProviders(
    category?: string,
    location?: { lat: number; lng: number; radius: number },
    filters?: {
      minRating?: number;
      isVerified?: boolean;
      priceRange?: { min: number; max: number };
    }
  ): Promise<ServiceProvider[]> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (location) {
        params.append('lat', location.lat.toString());
        params.append('lng', location.lng.toString());
        params.append('radius', location.radius.toString());
      }
      if (filters?.minRating) params.append('minRating', filters.minRating.toString());
      if (filters?.isVerified !== undefined) params.append('isVerified', filters.isVerified.toString());
      if (filters?.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }

      const response = await fetch(`${this.baseUrl}/api/service-providers?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service providers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }
  }

  // Create a booking request
  async createBooking(bookingData: Omit<BookingRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<BookingRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create booking: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Process payment for booking
  async processPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentDetails)
      });

      if (!response.ok) {
        throw new Error(`Payment processing failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Get booking status
  async getBookingStatus(bookingId: string): Promise<BookingRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: BookingRequest['status']): Promise<BookingRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Failed to update booking: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Calculate commission
  calculateCommission(amount: number, commissionRate: number = 0.1): number {
    return amount * commissionRate;
  }

  // Get available time slots for a service provider
  async getAvailableSlots(
    serviceProviderId: string,
    date: string,
    serviceId: string
  ): Promise<string[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/service-providers/${serviceProviderId}/availability?date=${date}&serviceId=${serviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }
  }
}

// Initialize the service
export const businessBookingService = new BusinessBookingService(
  process.env.VITE_API_BASE_URL || 'https://api.ummahconnects.com',
  process.env.VITE_API_KEY || ''
);







