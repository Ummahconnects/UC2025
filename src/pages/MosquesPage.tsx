// src/pages/MosquesPage.tsx
import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient.ts";
import { MosqueService } from '@/lib/services/mosqueService';
import MosquesHeader from "./mosques/MosquesHeader";
import MosquesContent from "./mosques/MosquesContent";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import type { MosqueWithDetails } from "@/types/mosque";
import { useLocationContext } from "@/contexts/location/useLocationContext";

const MosquesPage: React.FC = () => {
  const [mosques, setMosques] = useState<MosqueWithDetails[]>([]);
  const [filteredMosques, setFilteredMosques] = useState<MosqueWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location: userLocation } = useLocationContext();
  // Keep a static background image for the mosques page to avoid changing on clicks
  const [bgImage] = useState<string>("/images/new-images/new (2).jpg");

  // Fetch mosques from multiple tables via BusinessService with location
  useEffect(() => {
    const fetchMosques = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔍 [MosquesPage] Fetching mosques with location:', userLocation);
        let data = await MosqueService.getMosques(1, 1000, userLocation as any);
        console.log('🔍 [MosquesPage] MosqueService returned:', data?.length || 0, 'mosques');

        // Fallback to direct table if service returns empty
        if (!data || data.length === 0) {
          console.log('🔍 [MosquesPage] MosqueService returned empty, trying direct table query');
          const res = await supabase.from("mosques").select("*");
          if (res.error) throw res.error;
          data = res.data || [];
          console.log('🔍 [MosquesPage] Direct table query returned:', data?.length || 0, 'mosques');
        }
        setMosques(data);
        setFilteredMosques(data);
      } catch (err) {
        console.error('🔍 [MosquesPage] Error in MosqueService:', err);
        // Fallback to single-table if service fails
        try {
          console.log('🔍 [MosquesPage] Trying fallback direct table query');
          const { data, error } = await supabase.from("mosques").select("*");
          if (error) throw error;
          console.log('🔍 [MosquesPage] Fallback query returned:', data?.length || 0, 'mosques');
          setMosques(data || []);
          setFilteredMosques(data || []);
        } catch (e) {
          console.error('🔍 [MosquesPage] Fallback query also failed:', e);
          setError("Failed to fetch mosques");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchMosques();
  }, [userLocation?.lat, userLocation?.lng]);

  // Distance helper (Haversine)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // MosqueService handles location-based sorting, so we just use the results
  useEffect(() => {
    if (!mosques || mosques.length === 0) {
      setFilteredMosques([]);
      return;
    }

    // If user has location, MosqueService already sorted by distance
    // If no location, MosqueService returns in a reasonable order
    setFilteredMosques(mosques.slice(0, 200) as any); // Show top 200 results
  }, [mosques]);

  const handleFilterChange = (filters: {
    type?: string;
    city?: string;
    state?: string;
    facilities?: string[];
    services?: string[];
    query?: string;
  }) => {
    let filtered = [...mosques];

    // Apply search query filter
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (mosque) =>
          mosque.name?.toLowerCase().includes(query) ||
          mosque.address?.toLowerCase().includes(query) ||
          mosque.city?.toLowerCase().includes(query)
      );
    }

    // Apply city filter
    if (filters.city) {
      filtered = filtered.filter((mosque) => mosque.city === filters.city);
    }

    // Apply state filter
    if (filters.state) {
      filtered = filtered.filter((mosque) => mosque.state === filters.state);
    }

    setFilteredMosques(filtered);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-12">
          <div className="text-center text-red-600">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background image */}
      <div
        className="fixed inset-0 z-[-2] pointer-events-none select-none"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: 0.8,
          filter: 'saturate(1.2) contrast(1.05)',
          width: '100vw',
          height: '100vh',
        }}
      />
      <div className="min-h-screen bg-transparent relative z-10">
        <ErrorBoundary>
          <MosquesHeader />
          <MosquesContent
            mosques={mosques}
            filteredMosques={filteredMosques}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </ErrorBoundary>
      </div>
    </>
  );
};

export default MosquesPage;