import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { BusinessWithDetails } from "@/types/business";
import { BusinessService } from "@/lib/services/businessService.ts";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  ChevronLeft, 
  Award,
  MessageCircle,
  Share2,
  Heart,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import PremiumPackagesPromo from "@/components/business/PremiumPackagesPromo";
import FreeMosqueCharityListingsBanner from "@/components/FreeMosqueCharityListingsBanner";
import AdvancedSEO from "@/components/AdvancedSEO";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import Breadcrumb from "@/components/Breadcrumb";

const BusinessPage = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<BusinessWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setIsLoading(true);
        const data = await BusinessService.getBusinessById(id!);
        setBusiness(data);
      } catch (error) {
        console.error('Error fetching business:', error);
        setBusiness(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBusiness();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse flex flex-col gap-8">
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
          <div className="h-64 bg-gray-200 w-full rounded-lg"></div>
          <div className="h-4 bg-gray-200 w-full rounded"></div>
          <div className="h-4 bg-gray-200 w-full rounded"></div>
          <div className="h-4 bg-gray-200 w-2/3 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h2>
          <p className="text-gray-600 mb-6">The business you're looking for doesn't exist or has been removed.</p>
          <Link to="/businesses">
            <Button>Back to Businesses</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
      <div className="bg-gray-50">
        {/* Advanced SEO */}
        <AdvancedSEO
          title={`${business.name} - ${business.business_type} | Ummah Connects`}
          description={`${business.description || `Find ${business.name}, a trusted ${business.business_type} in ${business.city}. ${business.certification_info?.halal ? 'Halal certified' : 'Muslim-owned'} business serving the community.`}`}
          keywords={[
            business.name.toLowerCase(),
            business.business_type.toLowerCase(),
            business.certification_info?.halal ? 'halal' : 'muslim-owned',
            business.city.toLowerCase(),
            'ummah connects',
            'muslim business directory'
          ]}
          image={business.image || undefined}
          url={`/businesses/${business.id}`}
          type="business"
          businessData={{
            name: business.name,
            address: `${business.address}, ${business.city}${business.state ? `, ${business.state}` : ''}${business.postal_code ? ` ${business.postal_code}` : ''}`,
            phone: business.phone || undefined,
            email: business.email || undefined,
            rating: business.rating,
            reviewCount: business.reviews_count,
            priceRange: business.pricing,
            categories: [business.business_type]
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button and breadcrumbs */}
          <div className="flex items-center mb-6">
            <Link to="/businesses" className="flex items-center text-sm text-gray-600 hover:text-muslim-teal">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Businesses
            </Link>
          </div>

          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Businesses', href: '/businesses' },
              { label: business.business_type, href: `/businesses?type=${business.business_type}` },
              { label: business.name, href: `/businesses/${business.id}` }
            ]}
          />
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Hero image and overlay */}
            <div className="relative h-64 sm:h-80 lg:h-96">
              <img
                src={business.image || (business as any).cover_image || (business as any).featured_image || (business as any).logo || '/images/fallback/ummah-c (6).png'}
                alt={business.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center mb-2">
          <Badge className="bg-muslim-teal text-white">{business.business_type || 'Business'}</Badge>
                  {business.is_featured && (
                    <Badge className="ml-2 bg-amber-500 text-white">Featured</Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{business.name}</h1>
                <div className="flex items-center text-white">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                    <span className="font-medium mr-2">{typeof business.rating === 'number' ? business.rating.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business details */}
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-8">
                <Button className="bg-muslim-teal hover:bg-muslim-teal/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </div>
              
              <Tabs defaultValue="info">
                <TabsList className="mb-6">
                  <TabsTrigger value="info">Business Info</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-bold mb-4">About</h2>
                          <p className="text-gray-600">
                            {business.description || `${business.name} is a ${business.business_type?.toLowerCase() || 'local'} business serving the local Muslim community.`}
                          </p>
                        </div>
                        
                        {business.facilities && business.facilities.length > 0 && (
                          <div>
                            <h2 className="text-xl font-bold mb-4">Services & Facilities</h2>
                            <div className="flex flex-wrap gap-2">
                              {business.facilities.map((facility: string) => (
                                <Badge key={facility} variant="outline" className="py-1.5">{facility}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {business.hours && (
                          <div>
                            <h2 className="text-xl font-bold mb-4">Business Hours</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {Object.entries(business.hours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between py-2 border-b">
                                  <span className="font-medium">{day}</span>
                                  <span>{hours}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                        <h3 className="text-lg font-bold">Contact Information</h3>
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-muslim-teal mt-0.5 mr-3" />
                          <span className="text-gray-700">{business.address}</span>
                        </div>
                        {business.phone && (
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 text-muslim-teal mr-3" />
                            <span className="text-gray-700">{business.phone}</span>
                          </div>
                        )}
                        {business.website && (
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-muslim-teal mr-3" />
                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-muslim-teal hover:underline">
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {business.social_media && (
                        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-bold mb-4">Social Media</h3>
                          <div className="space-y-3">
                            {Object.entries(business.social_media).map(([platform, url]) => (
                              url && (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muslim-teal hover:underline block"
                                >
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </a>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Reviews</h2>
                      <Button>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <p className="text-gray-600 mb-4">Be the first to review {business.name}!</p>
                      <Button>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="photos">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Photos</h2>
                      <Button>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Photos
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={business.image || '/images/businesses/placeholder.jpg'} 
                          alt={business.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Claim and Booking funnel */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Claim your business */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Own this business?</h3>
              <p className="text-gray-600 mb-4">
                Claim your profile to update details, add photos, and respond to reviews.
              </p>
              <Link to={`/business-register?claim=${business.id}`}>
                <Button className="bg-muslim-teal hover:bg-muslim-teal/90 w-full">Claim this Business</Button>
              </Link>
            </div>

            {/* Booking system */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book clients online</h3>
              <p className="text-gray-600 mb-4">
                Connect your booking system or use our Shopify-powered checkout.
              </p>
              <Link to="/bookings">
                <Button className="bg-muslim-gold hover:bg-muslim-gold/90 text-white w-full">Enable Booking Services</Button>
              </Link>
            </div>
          </div>

          {/* Islamic-themed packages (placeholder copy) */}
          <div className="mt-10">
            <div className="bg-gradient-to-r from-[#FFF8E6] to-[#F1F7F6] rounded-2xl p-8 border">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Packages tailored for the Ummah</h3>
                <p className="text-gray-700 mb-6">Barakah, Ihsan, and Platinum plans designed for halal businesses and community services.</p>
                <Link to="/sales">
                  <Button variant="outline" className="border-muslim-teal text-muslim-teal">Explore Packages</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

// Helper component for the ImageIcon
const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
};

export default BusinessPage;
