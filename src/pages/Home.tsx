// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/Button";
import { BusinessService } from "@/lib/services/businessService.ts";
import { MosqueService } from '@/lib/services/mosqueService.ts';
import BusinessCard from "@/components/ui/BusinessCard";
import MosqueCard from "@/components/MosqueCard";
import { useLocationContext } from "@/contexts/location/useLocationContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Users, Calendar } from "lucide-react";

// Regular imports (temporary fix)
import MajorSponsorsSection from "@/components/MajorSponsorsSection";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import LiveChatSupport from "./help/components/LiveChatSupport";

import "./Home.css";

// Sample mosque data in case we don't get any from the database
const sampleMosques = [
  {
    id: 'mosque-1',
    name: 'Perth Mosque',
    mosque_type: 'Masjid',
    address: '427 William St',
    city: 'Perth',
    state: 'Western Australia',
    country: 'Australia',
    image: '/images/fallback/20250916_131826.jpg',
    latitude: -31.9434,
    longitude: 115.8543,
    prayer_times: {
      fajr: '5:30',
      dhuhr: '12:30',
      asr: '15:45',
      maghrib: '18:15',
      isha: '19:45'
    }
  },
  {
    id: 'mosque-2',
    name: 'Masjid Al-Taqwa',
    mosque_type: 'Islamic Center',
    address: '15 Kitchener Ave',
    city: 'Burswood',
    state: 'Western Australia',
    country: 'Australia',
    image: '/images/fallback/20250916_131845.jpg',
    latitude: -31.9634,
    longitude: 115.8943,
    prayer_times: {
      fajr: '5:15',
      dhuhr: '12:15',
      asr: '15:30',
      maghrib: '18:00',
      isha: '19:30'
    }
  },
  {
    id: 'mosque-3',
    name: 'Thornlie Mosque',
    mosque_type: 'Masjid',
    address: '45 Yale Rd',
    city: 'Thornlie',
    state: 'Western Australia',
    country: 'Australia',
    image: '/images/fallback/20250916_131857.jpg',
    latitude: -32.0534,
    longitude: 115.9543,
    prayer_times: {
      fajr: '5:20',
      dhuhr: '12:20',
      asr: '15:40',
      maghrib: '18:10',
      isha: '19:40'
    }
  },
  {
    id: 'mosque-4',
    name: 'Mirrabooka Mosque',
    mosque_type: 'Islamic Center',
    address: '20 Boyare Ave',
    city: 'Mirrabooka',
    state: 'Western Australia',
    country: 'Australia',
    image: '/images/fallback/20250916_131904.jpg',
    latitude: -31.8734,
    longitude: 115.8343,
    prayer_times: {
      fajr: '5:25',
      dhuhr: '12:25',
      asr: '15:35',
      maghrib: '18:05',
      isha: '19:35'
    }
  }
];

function Home() {
  console.log('🏠 Home component is rendering!');
  
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [mosques, setMosques] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to show content immediately
  const [initialLoad, setInitialLoad] = useState(false);
  const { location: userLocation, isLoading: locationLoading } = useLocationContext();
  // Top hero now shows Community and Book Now boxes (no search fields)

  // Chatbot mascot image (single, no fallbacks)
  const mascotSrc = "/images/fallback/ad322.png"; // Using existing image as mascot

  // Fetch real data from Supabase with optimized queries
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🏠 Home: Fetching real Supabase data');
        
        // Fetch businesses efficiently - use proper database querying
        console.log('🏠 Home: Fetching businesses from database');
        console.log('🏠 Home: User location:', userLocation);
        const allBusinesses = await BusinessService.getBusinesses(1, 100, userLocation);
        console.log('🏠 Home: Total businesses fetched:', allBusinesses.length);
        console.log('🏠 Home: First business:', allBusinesses[0]);
        
        // Separate by type and category (like Google's filtering)
        const featuredBusinesses = allBusinesses.filter(b => b.featured || b.is_featured).slice(0, 6);
        const regularBusinesses = allBusinesses.filter(b => 
          !b.featured && !b.is_featured && 
          b.business_type !== 'Mosque' && 
          b.business_type !== 'mosque'
        ).slice(0, 12);
        
        // Get mosques using dedicated mosque service with location filtering
        const mosqueBusinesses = await MosqueService.getMosques(1, 4, userLocation as any);
        console.log('🏠 Home: Mosques:', mosqueBusinesses.length);
        
        // If we don't have any mosques from the database, use sample data
        if (mosqueBusinesses.length === 0) {
          console.log('🏠 Home: Using sample mosque data');
          setMosques(sampleMosques);
        } else {
          setMosques(mosqueBusinesses);
        }
        
        setFeaturedListings(featuredBusinesses);
        setFeatured(regularBusinesses);
        
      } catch (error) {
        console.error('🏠 Home: Error fetching data:', error);
        // Fallback to empty arrays if Supabase fails
        setFeaturedListings([]);
        setFeatured([]);
        setMosques(sampleMosques); // Use sample mosques as fallback
      } finally {
        setLoading(false);
      }
    };

    if (userLocation && !locationLoading) {
      fetchData();
    } else if (!locationLoading) {
      // If we don't have location but we're not loading, use sample data
      setMosques(sampleMosques);
    }
  }, [userLocation, locationLoading]);

  if (loading && initialLoad) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Seo 
        title="Ummah Connects - Muslim Business Directory & Community Platform"
        description="Find trusted halal businesses, mosques, and Islamic services. Connect with the Muslim community and support Muslim entrepreneurs."
      />
      
      {/* Background Animation - Subtle animated pattern for less bland appearance */}
      <div className="background-animation"></div>
      
      {/* Bismillah */}
      <div className="py-6 text-center">
        <div className="bismillah text-muslim-teal text-5xl md:text-6xl font-extrabold">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</div>
        <p className="text-sm text-gray-900 font-semibold">In the name of Allah, the Most Gracious, the Most Merciful</p>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mt-4">UMMAH-CONNECTS</h1>
        <p className="text-lg text-gray-900 font-semibold mt-2">The best of you are those who are best to other people</p>
        <p className="text-md text-gray-900 font-semibold mt-1">For Muslims, By Muslims — A place where all services connect.</p>
        <p className="text-md text-gray-900 font-semibold">Find Muslim-Owned Businesses from your local community and worldwide.</p>
      </div>
      
      {/* Dual Hero Section - Community and Book Now */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero 1: Community */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-muslim-teal" />
                <h2 className="text-2xl font-bold text-gray-900">Community</h2>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">Join groups, discussions, events and support the Ummah.</p>
              <Link to="/community">
                <button className="w-full bg-muslim-teal hover:bg-muslim-teal/90 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                  Enter Community
                </button>
              </Link>
            </div>
            
            {/* Hero 2: Book Now / Shopify */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-muslim-teal" />
                <h2 className="text-2xl font-bold text-gray-900">Book Now</h2>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">Booking services</p>
              <Link to="/bookings" className="block">
                <button className="w-full bg-muslim-gold hover:bg-muslim-gold/90 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                  Booking Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Removed SalesDriveAnnouncement banner */}
      
      {/* Muslim-owned businesses section - Location-based like Yelp */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-muslim-teal mb-2">
              Muslim businesses {userLocation ? `near ${userLocation.city || userLocation.country || 'you'}` : 'worldwide'}
            </h2>
            <p className="text-lg text-gray-600">Shop with intention, support the Ummah</p>
            {userLocation?.lat && userLocation?.lng ? (
              <p className="text-sm text-gray-500 mt-2">
                Showing businesses within 50km of your location
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Enable location services to find businesses near you
              </p>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (featuredListings.length > 0 || featured.length > 0) ? (
            <>
              {/* 2 Large Featured Cards (like live site) */}
              {featuredListings.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {featuredListings.map((business, index) => (
                    <div key={business.id} className="card-grid-item">
                      <BusinessCard {...business} isLargeCard={true} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* 9 Regular Cards (like live site) */}
              {featured.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((business, index) => (
                    <div key={business.id} className="card-grid-item">
                      <BusinessCard {...business} />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center mt-8">
                <Link to="/businesses">
                  <Button className="bg-muslim-teal hover:bg-muslim-teal/90 text-white px-8 py-3">
                    View All Businesses
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-muslim-teal/10 border-2 border-muslim-teal p-4 rounded">
                <h3 className="text-lg font-bold text-muslim-teal">No businesses found</h3>
                <p className="text-gray-700">We're working on adding more businesses to your area.</p>
                <p className="text-gray-700">Featured listings: {featuredListings.length}</p>
                <p className="text-gray-700">Featured regular: {featured.length}</p>
                <p className="text-gray-700">Total businesses: {featuredListings.length + featured.length}</p>
              </div>
              <Link to="/businesses" className="text-muslim-teal hover:underline mt-2 inline-block">
                Browse all businesses
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* 5. Our Distinguished Corporate Sponsors */}
      <MajorSponsorsSection />
      
      {/* 6. Mosques & Islamic Centers - Always show 4 mosques */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-muslim-teal mb-4">Mosques & Islamic Centers</h2>
            <p className="text-lg text-gray-600">Find places of worship {userLocation ? `near ${userLocation.city || userLocation.country || 'you'}` : 'worldwide'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mosques.slice(0, 4).map((mosque, index) => (
              <div key={mosque.id} className="card-grid-item">
                <MosqueCard {...mosque} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/mosques" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-muslim-teal hover:bg-muslim-teal-dark transition-colors"
            >
              View All Mosques
            </Link>
          </div>
        </div>
      </section>
      
      {/* Beta Banner Section */}
      <div className="beta-banner py-4 text-center">
        <p className="text-lg font-semibold">All Muslim businesses are listed for FREE. Upgrade to a featured listing for more visibility and premium features.</p>
      </div>
      
      {/* Optional: Remaining sections */}
      <Testimonials />
      <CallToAction />

      {/* Floating AI Chat Widget - bottom-right */}
      {/* Chatbot mascot (decorative) */}
      {mascotSrc && (
        <img
          src={mascotSrc}
          alt="Ummah-Connects Chatbot"
          style={{ position: "fixed", right: 88, bottom: 84, zIndex: 50, width: 56, height: 56, borderRadius: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", background: "white", objectFit: "cover" }}
        />
      )}

      <div
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50, width: 360, maxWidth: "90vw" }}
        aria-label="AI Chat Assistant"
      >
        <LiveChatSupport />
      </div>
    </div>
  );
}
export default Home;
