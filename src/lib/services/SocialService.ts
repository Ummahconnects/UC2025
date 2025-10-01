import { supabase } from '@/integrations/supabase/client';
import { logger } from '../errors/Logger';

export interface SocialMediaAccount {
  id: string;
  entity_type: 'mosque' | 'business';
  entity_id: string;
  platform: string;
  handle?: string;
  url: string;
  active?: boolean;
  created_at: string;
  updated_at?: string;
  // Additional fields for display
  entity_name?: string;
  entity_address?: string;
  entity_city?: string;
  entity_category?: string;
}

export interface SocialFilters {
  platform?: string;
  entity_type?: 'mosque' | 'business';
  active?: boolean;
}

export class SocialService {
  static async getSocialAccounts(
    page: number = 1,
    limit: number = 1000,
    filters?: SocialFilters
  ): Promise<SocialMediaAccount[]> {
    try {
      console.log('[SocialService] Fetching social accounts from Supabase', { page, limit, filters });
      
      // First, get all social accounts without joins
      let query = supabase
        .from('socials')
        .select('*');

      // Apply filters
      if (filters) {
        if (filters.platform) {
          query = query.eq('platform', filters.platform);
        }
        if (filters.entity_type) {
          query = query.eq('entity_type', filters.entity_type);
        }
        if (filters.active !== undefined) {
          query = query.eq('active', filters.active);
        }
      }

      // Add pagination
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);
      
      const { data: socialData, error: socialError } = await query;
      
      console.log('[SocialService] Fetched social accounts:', { count: socialData?.length, error: socialError });
      
      if (socialError) throw socialError;
      
      if (!socialData || socialData.length === 0) {
        return [];
      }

      // Now fetch entity details separately for each social account
      const transformedData = await Promise.all(
        socialData.map(async (social: any) => {
          let entityData = null;
          
          try {
            if (social.entity_type === 'mosque') {
              const { data: mosqueData } = await supabase
                .from('mosques')
                .select('name, address, city, category')
                .eq('id', parseInt(social.entity_id, 10))
                .single();
              entityData = mosqueData;
            } else if (social.entity_type === 'business') {
              const { data: businessData } = await supabase
                .from('businesses')
                .select('name, address, city, category')
                .eq('id', parseInt(social.entity_id, 10))
                .single();
              entityData = businessData;
            }
          } catch (entityError) {
            console.warn(`[SocialService] Could not fetch entity data for ${social.entity_type} ${social.entity_id}:`, entityError);
          }
          
          return {
            ...social,
            entity_name: entityData?.name || `Unknown ${social.entity_type}`,
            entity_address: entityData?.address || 'Unknown Address',
            entity_city: entityData?.city || 'Unknown City',
            entity_category: entityData?.category || 'General'
          };
        })
      );
      
      return transformedData as SocialMediaAccount[];
    } catch (err) {
      console.error('[SocialService] Error fetching social accounts:', err);
      throw err;
    }
  }

  static async getSocialAccountsByEntity(
    entityType: 'mosque' | 'business',
    entityId: string
  ): Promise<SocialMediaAccount[]> {
    try {
      const { data, error } = await supabase
        .from('socials')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) {
        logger.error('Error fetching social accounts by entity:', { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getSocialAccountsByEntity:', { error });
      throw error;
    }
  }

  static async getSocialAccountsByPlatform(platform: string): Promise<SocialMediaAccount[]> {
    try {
      const { data, error } = await supabase
        .from('socials')
        .select('*')
        .eq('platform', platform);

      if (error) {
        logger.error('Error fetching social accounts by platform:', { error });
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getSocialAccountsByPlatform:', { error });
      throw error;
    }
  }

  static async getAllPlatforms(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('socials')
        .select('platform')
        .not('platform', 'is', null);

      if (error) {
        logger.error('Error fetching platforms:', { error });
        throw error;
      }

      // Get unique platforms
      const platforms = [...new Set(data?.map(item => item.platform) || [])];
      return platforms;
    } catch (error) {
      logger.error('Error in getAllPlatforms:', { error });
      throw error;
    }
  }

  static async getSocialStats() {
    try {
      const { data, error } = await supabase
        .from('socials')
        .select('platform, entity_type')
        .not('platform', 'is', null);

      if (error) {
        logger.error('Error fetching social stats:', { error });
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        byPlatform: {} as Record<string, number>,
        byEntityType: {} as Record<string, number>
      };

      data?.forEach(item => {
        // Count by platform
        stats.byPlatform[item.platform] = (stats.byPlatform[item.platform] || 0) + 1;
        // Count by entity type
        stats.byEntityType[item.entity_type] = (stats.byEntityType[item.entity_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error in getSocialStats:', { error });
      throw error;
    }
  }
}