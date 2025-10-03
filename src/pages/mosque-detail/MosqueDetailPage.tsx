import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "@/lib/supabaseClient.ts";
import { MosqueService } from "@/lib/services/mosqueService";
import ReviewSection from "@/components/reviews/ReviewSection";
import LoadingSpinner from "@/components/LoadingSpinner";

// Import components
import MosqueDetailHeader from "./components/MosqueDetailHeader";
import PrayerTimesCard from "./components/PrayerTimesCard";
import CommunityGallery from "./components/CommunityGallery";
import MosqueSidebar from "./components/MosqueSidebar";
import MosqueNotFound from "./components/MosqueNotFound";
import type { MosqueWithDetails } from "@/types/mosque";

const MosqueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [mosque, setMosque] = useState<MosqueWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMosqueDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) {
          setError('Invalid mosque ID');
          return;
        }

        console.log('🔍 [MosqueDetailPage] Fetching mosque with ID:', id);

        // Try using MosqueService first (searches all tables)
        try {
          const data = await MosqueService.getMosqueById(id);
          if (data) {
            console.log('✅ [MosqueDetailPage] Found mosque via MosqueService:', data.name);
            setMosque(data);
            return;
          }
        } catch (serviceError) {
          console.warn('⚠️ [MosqueDetailPage] MosqueService failed, trying direct query:', serviceError);
        }

        // Fallback: Try direct Supabase query on main mosques table
        console.log('🔍 [MosqueDetailPage] Trying direct query on mosques table');
        const { data: directData, error: directError } = await supabase
          .from('mosques')
          .select('*')
          .eq('id', id)
          .single();

        if (!directError && directData) {
          console.log('✅ [MosqueDetailPage] Found mosque via direct query:', directData.name);
          setMosque(directData);
          return;
        }

        // If still not found, try by slug
        console.log('🔍 [MosqueDetailPage] Trying to find by slug');
        const { data: slugData, error: slugError } = await supabase
          .from('mosques')
          .select('*')
          .eq('slug', id)
          .single();

        if (!slugError && slugData) {
          console.log('✅ [MosqueDetailPage] Found mosque by slug:', slugData.name);
          setMosque(slugData);
          return;
        }

        // Not found in any way
        console.error('❌ [MosqueDetailPage] Mosque not found with ID:', id);
        setError('Mosque not found');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load mosque details';
        console.error('❌ [MosqueDetailPage] Error fetching mosque details:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMosqueDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !mosque) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MosqueNotFound message={error || 'Mosque not found'} />
      </div>
    );
  }

  return (
            <div className="relative min-h-screen">
              {/* Background Image */}
              <div 
                className="fixed inset-0 z-0"
                style={{
                  backgroundImage: "url('/images/new-images/newimages (6).jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: 0.3
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MosqueDetailHeader mosque={mosque} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <PrayerTimesCard mosque={mosque} isLoading={false} />
                  <CommunityGallery mosque={mosque} isLoading={false} />
                  {/* Reviews Section */}
                  <ReviewSection 
                    entityName={mosque.name}
                    businessId={mosque.id.toString()}
                    reviewPrompt={`Share your experience visiting ${mosque.name}...`}
                  />
                </div>

        {/* Sidebar */}
        <MosqueSidebar mosque={mosque} isLoading={false} />
      </div>
      </div>
    </div>
  );
};

export default MosqueDetailPage;
