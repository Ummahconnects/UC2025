import { Star, MapPin, Phone } from "lucide-react";
import { useLocationContext } from '@/contexts/location/useLocationContext';
import { haversineKm, formatKm } from '@/utils/geo';
import { Link } from "react-router-dom";
import type { SyntheticEvent } from "react";
import { useState, useEffect } from "react";
import { GooglePlacesService } from '../../lib/services/googlePlacesService.ts';
import "./BusinessCard.css";

export interface BusinessCardProps {
  id: string | number;
  name: string;
  slug?: string;
  business_type?: string;
  business_category?: string;
  short_description?: string;
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews_count?: number;
  verified_count?: number;
  phone?: string;
  image?: string;
  cover_image?: string;
  featured_image?: string;
  logo?: string;
  featured?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  is_premium?: boolean;
  is_founding_member?: boolean;
  status?: string;
  pricing?: string;
  tags?: string[];
  certification_info?: any;
  social_media?: any;
  youtube_channel?: string;
  youtube_thumbnail?: string;
  youtube_title?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  isLargeCard?: boolean;
  className?: string;
  showFullDetails?: boolean;
}

export default function BusinessCard({
  id,
  name,
  slug,
  business_type,
  business_category,
  location,
  address,
  city,
  country,
  state,
  latitude,
  longitude,
  image,
  featured_image,
  cover_image,
  logo,
  rating = 0,
  reviews_count = 0,
  is_verified,
  is_premium,
  phone,
}: BusinessCardProps) {
  const { location: userLocation } = useLocationContext();
  
  // Google Places rating state
  const [googleRating, setGoogleRating] = useState<{
    rating: number;
    reviewCount: number;
    reviews: Array<{
      author: string;
      rating: number;
      text: string;
      time: string;
    }>;
  } | null>(null);
  
  const [isLoadingRating, setIsLoadingRating] = useState(false);
  
  // Simple function to get a fallback image based on ID
  const getFallbackImage = () => {
    // Use all available fallback images - including the new ummah-c images
    const fallbackImages = [
      '/images/fallback/ummah-c (1).png',
      '/images/fallback/ummah-c (2).png',
      '/images/fallback/ummah-c (3).png',
      '/images/fallback/ummah-c (4).png',
      '/images/fallback/ummah-c (5).png',
      '/images/fallback/ummah-c (6).png',
      '/images/fallback/ummah-c (7).png',
      '/images/fallback/ad108.png',
      '/images/fallback/ad127.png',
      '/images/fallback/ad145.png',
      '/images/fallback/ad186.png',
      '/images/fallback/Gemini_Generated_Image_60ygsx60ygsx60yg (1).png',
      '/images/fallback/generated-image (9).png',
      '/images/fallback/generated-image (14).png',
      '/images/fallback/generated-image (15).png',
      '/images/fallback/generated-image (20).png',
      '/images/fallback/generated-image (22).png',
      '/images/fallback/generated-image (23).png',
      '/images/fallback/generated-image (25) (1).png',
      '/images/fallback/generated-image (27).png'
    ];
    
    // Convert ID to a number for indexing
    let idNum;
    if (typeof id === 'string') {
      // Use the first character's code for string IDs
      idNum = id.charCodeAt(0);
    } else if (typeof id === 'number') {
      // Use the number directly
      idNum = id;
    } else {
      // Fallback to a random index if ID is undefined
      idNum = Math.floor(Math.random() * fallbackImages.length);
    }
    
    // Use modulo to get an index within the array bounds
    return fallbackImages[Math.abs(idNum) % fallbackImages.length];
  };

  // Business URL - route mosques to mosque detail
  const isMosque = (business_type || '').toLowerCase() === 'mosque';
  const businessUrl = isMosque ? `/mosque/${id}` : `/business/${id}`;
  
  // Fetch Google Places rating
  useEffect(() => {
    const fetchGoogleRating = async () => {
      if (!name) return;
      
      setIsLoadingRating(true);
      try {
        const ratingData = await GooglePlacesService.getBusinessRating(name, address, city);
        if (ratingData) {
          setGoogleRating(ratingData);
          console.log(`🌟 [BusinessCard] Got Google rating for ${name}: ${ratingData.rating}/5 (${ratingData.reviewCount} reviews)`);
        }
      } catch (error) {
        console.error(`❌ [BusinessCard] Error fetching Google rating for ${name}:`, error);
      } finally {
        setIsLoadingRating(false);
      }
    };

    fetchGoogleRating();
  }, [name, address, city]);

  // Get image source: prefer provided images; otherwise use varied fallback pool
  let imgSrc = image || featured_image || cover_image || logo || '';
  if (!imgSrc) {
    imgSrc = getFallbackImage();
  }
  
  // Use Google rating if available, otherwise fall back to database rating
  const displayRating = googleRating?.rating || rating;
  const displayReviewCount = googleRating?.reviewCount || reviews_count;
  const isGoogleRating = !!googleRating;

  return (
    <Link to={businessUrl} className="block">
      <div className="business-card">
        {/* Image - 3/4 of card height */}
        <div className="business-image">
          <img 
            src={imgSrc} 
            alt={name || 'Business'} 
            className="w-full h-72 object-cover rounded-t-lg"
            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.src = getFallbackImage();
            }}
          />
        </div>
        
        {/* Content */}
        <div className="business-content">
          <h3 className="business-name">{name}</h3>
          <div className="business-type">{business_type || business_category}</div>
          
          {address && (
            <div className="business-address">
              <MapPin className="address-icon" />
              <span>{address}</span>
            </div>
          )}

          <div className="business-location">
            <MapPin className="location-icon" />
            <span>
              {location || [city, state, country].filter(Boolean).join(', ') || 'Location not specified'}
              {userLocation?.lat != null && userLocation?.lng != null && latitude != null && longitude != null && (
                <> • {formatKm(haversineKm(userLocation.lat, userLocation.lng, latitude, longitude))}</>
              )}
            </span>
          </div>

          {phone && (
            <div className="business-contact">
              <Phone className="phone-icon" />
              <a href={`tel:${phone}`} className="contact-text">{phone}</a>
            </div>
          )}
          
          <div className="business-rating">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(displayRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="ml-1 text-sm font-medium">{displayRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm ml-1">({displayReviewCount})</span>
              {isGoogleRating && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Google
                </span>
              )}
              {isLoadingRating && (
                <span className="ml-2 text-xs text-gray-500">
                  Loading...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}