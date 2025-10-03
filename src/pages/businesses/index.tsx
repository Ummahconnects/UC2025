import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useSearchParams, Outlet, useLocation } from "react-router-dom";
// import Layout from "../../components/Layout"; // Layout is provided by AppRouter
import { Input } from "../../components/ui/Input.tsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/Select.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Checkbox } from "../../components/ui/Checkbox.tsx";
// import { LocationContext } from "../../contexts/location/LocationContext"; 
// import * as React from "react"; 
import BusinessesContent from "./BusinessesContent";
import { BusinessService } from "@/lib/services/businessService";
import { useLocationContext } from "@/contexts/location/useLocationContext";
import type { BusinessWithDetails } from "@/types/business";

// Add simple types to avoid 'any' linter errors
// You can refine these types later as needed

const BusinessesPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isBaseRoute = location.pathname === "/businesses";
  const categoryParam = searchParams.get('category');
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [localOnly, setLocalOnly] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { location: userLocation } = useLocationContext();
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('businesses_theme') || 'light';
  });
  const dark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem('businesses_theme', theme);
  }, [theme]);
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch businesses using shared location-based logic
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const all = await BusinessService.getBusinesses(1, 200, userLocation as any);
      // Exclude mosques from this page
      const nonMosques = (all || []).filter(b => (b.business_type || '').toLowerCase() !== 'mosque');
      setBusinesses(nonMosques as BusinessWithDetails[]);
      setIsLoading(false);
    }
    fetchData();
  }, [userLocation?.lat, userLocation?.lng]);

  // Filter businesses client-side (search, category)
  const filteredBusinesses = businesses.filter(business => {
      // Search filter
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        const matchesSearch = 
        (business.name ?? '').toLowerCase().includes(term) ||
        (business.short_description ?? '').toLowerCase().includes(term) ||
        (business.address ?? '').toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      // Category filter
    if (selectedCategory !== "all") {
      if ((business.business_category ?? '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
    }
      return true;
    });
    
  // Get unique categories from businesses
  const uniqueCategories = Array.from(
    new Set(businesses.map(b => b.business_category).filter(Boolean))
  );

  return (
    <>
      {/* Themed backdrop */}
      <div
        className="fixed inset-0 z-[-2] pointer-events-none select-none"
        style={{
          backgroundImage: dark
            ? "linear-gradient(to bottom right, #0b1220, #111827)"
            : "url('/images/fallback/ad120.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: dark ? 1 : 0.5,
          width: '100vw',
          height: '100vh',
        }}
      />
      {isBaseRoute ? (
        <>
          {/* Compact header section for businesses page */}
          <div className="py-4">
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>Muslim Businesses</h1>
                  <p className={`${dark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Find halal restaurants, shops, professionals, and more</p>
                </div>
                <div className="w-40">
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className={`${dark ? 'text-gray-100 bg-gray-800 border-gray-700' : 'text-gray-900'}`}>
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Location indicator */}
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muslim-teal" />
                <span className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {location ?
                    `Current location: ${location}` :
                    "Location not set... (using default location)"
                  }
                </span>
              </div>
              {/* Show local results checkbox */}
              <div className="flex items-center">
                <Checkbox
                  id="local-only"
                  checked={localOnly}
                  onCheckedChange={(checked) => setLocalOnly(checked === true)}
                  className="mr-2"
                />
                <label htmlFor="local-only" className={`text-sm cursor-pointer ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Show results from your local area
                </label>
              </div>
            </div>
          </div>
          {/* Main content with businesses */}
          <BusinessesContent
            businesses={filteredBusinesses as BusinessWithDetails[]} 
            filteredBusinesses={filteredBusinesses as BusinessWithDetails[]}
            isLocalFiltered={localOnly}
            isLoading={isLoading} // Added isLoading prop
          />
          {/* Search bar moved to bottom, centered and narrower */}
          <div className="flex justify-center mt-8 mb-12">
            <div className="w-full max-w-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search businesses..."
                    className={`w-full pl-10 ${dark ? 'text-gray-100 bg-gray-800 border-gray-700 placeholder-gray-400' : 'text-gray-900'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search for businesses by name, category, or location"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="w-full sm:w-64">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className={`${dark ? 'text-gray-100 bg-gray-800 border-gray-700' : 'text-gray-900'}`}>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map((cat) => (
                        <SelectItem key={cat as string} value={cat as string}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setDebouncedSearchTerm(searchTerm)}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
};

// Export as default only (no named export)
export default BusinessesPage;
