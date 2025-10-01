import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
}

export interface StorageBucket {
  name: string;
  public: boolean;
  fileSizeLimit: string;
  allowedMimeTypes: string[];
}

export class StorageService {
  // Define available buckets
  static readonly BUCKETS = {
    IMAGES: 'images',
    MOSQUE_GALLERY: 'mosque-gallery',
    BUSINESS_IMAGES: 'business-images',
    VOUCHER_ASSETS: 'voucher-assets',
    OFFER_BANNERS: 'offer-banners'
  } as const;

  // Bucket configurations
  static readonly BUCKET_CONFIGS: Record<string, StorageBucket> = {
    [StorageService.BUCKETS.IMAGES]: {
      name: 'images',
      public: true,
      fileSizeLimit: '50MiB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    },
    [StorageService.BUCKETS.MOSQUE_GALLERY]: {
      name: 'mosque-gallery',
      public: true,
      fileSizeLimit: '50MiB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    },
    [StorageService.BUCKETS.BUSINESS_IMAGES]: {
      name: 'business-images',
      public: true,
      fileSizeLimit: '50MiB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    },
    [StorageService.BUCKETS.VOUCHER_ASSETS]: {
      name: 'voucher-assets',
      public: true,
      fileSizeLimit: '10MiB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf']
    },
    [StorageService.BUCKETS.OFFER_BANNERS]: {
      name: 'offer-banners',
      public: true,
      fileSizeLimit: '20MiB',
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    }
  };

  /**
   * Validate file before upload
   */
  static validateFile(file: File, bucketName: string): { valid: boolean; error?: string } {
    const config = this.BUCKET_CONFIGS[bucketName];
    if (!config) {
      return { valid: false, error: 'Invalid bucket name' };
    }

    // Check file size
    const maxSize = this.parseFileSize(config.fileSizeLimit);
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size exceeds limit. Maximum allowed: ${config.fileSizeLimit}` 
      };
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Parse file size string to bytes
   */
  private static parseFileSize(sizeString: string): number {
    const units: Record<string, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'KiB': 1024,
      'MiB': 1024 * 1024,
      'GiB': 1024 * 1024 * 1024
    };

    const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|KiB|MiB|GiB)$/i);
    if (!match) {
      throw new Error(`Invalid file size format: ${sizeString}`);
    }

    const [, size, unit] = match;
    return parseFloat(size) * units[unit.toUpperCase()];
  }

  /**
   * Generate unique filename
   */
  static generateFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${cleanBaseName}_${timestamp}_${random}.${ext}`;
    
    return prefix ? `${prefix}/${filename}` : filename;
  }

  /**
   * Upload file to storage bucket
   */
  static async uploadFile(
    file: File, 
    bucketName: string, 
    path?: string,
    options?: {
      upsert?: boolean;
      cacheControl?: string;
    }
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, bucketName);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate file path
      const filename = this.generateFilename(file.name, path);
      const filePath = path ? `${path}/${filename}` : filename;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          upsert: options?.upsert || false,
          cacheControl: options?.cacheControl || '3600'
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        filename: filename
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }

  /**
   * Upload voucher image
   */
  static async uploadVoucherImage(
    file: File, 
    voucherId?: string
  ): Promise<UploadResult> {
    const path = voucherId ? `vouchers/${voucherId}` : 'vouchers';
    return this.uploadFile(file, this.BUCKETS.VOUCHER_ASSETS, path);
  }

  /**
   * Upload offer banner
   */
  static async uploadOfferBanner(
    file: File, 
    offerId?: string
  ): Promise<UploadResult> {
    const path = offerId ? `offers/${offerId}` : 'offers';
    return this.uploadFile(file, this.BUCKETS.OFFER_BANNERS, path);
  }

  /**
   * Upload business image
   */
  static async uploadBusinessImage(
    file: File, 
    businessId?: string
  ): Promise<UploadResult> {
    const path = businessId ? `businesses/${businessId}` : 'businesses';
    return this.uploadFile(file, this.BUCKETS.BUSINESS_IMAGES, path);
  }

  /**
   * Upload mosque image
   */
  static async uploadMosqueImage(
    file: File, 
    mosqueId?: string
  ): Promise<UploadResult> {
    const path = mosqueId ? `mosques/${mosqueId}` : 'mosques';
    return this.uploadFile(file, this.BUCKETS.MOSQUE_GALLERY, path);
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(bucketName: string, filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Storage delete error:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  static getFileUrl(bucketName: string, filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  /**
   * List files in bucket
   */
  static async listFiles(
    bucketName: string, 
    path?: string, 
    limit = 100
  ): Promise<{ name: string; id: string; updated_at: string; created_at: string }[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path || '', {
          limit,
          offset: 0
        });

      if (error) {
        throw new Error(`List failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Storage list error:', error);
      throw error;
    }
  }

  /**
   * Download file
   */
  static async downloadFile(bucketName: string, filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Storage download error:', error);
      throw error;
    }
  }

  /**
   * Create signed URL for private files
   */
  static async createSignedUrl(
    bucketName: string, 
    filePath: string, 
    expiresIn = 3600
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw new Error(`Signed URL creation failed: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Signed URL creation error:', error);
      throw error;
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    buckets: Record<string, { size: number; count: number }>;
  }> {
    try {
      const buckets = Object.keys(this.BUCKET_CONFIGS);
      const stats: Record<string, { size: number; count: number }> = {};
      let totalSize = 0;
      let totalCount = 0;

      for (const bucketName of buckets) {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1000 });

        if (!error && data) {
          const bucketSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
          const bucketCount = data.length;
          
          stats[bucketName] = { size: bucketSize, count: bucketCount };
          totalSize += bucketSize;
          totalCount += bucketCount;
        }
      }

      return {
        totalSize,
        fileCount: totalCount,
        buckets: stats
      };
    } catch (error) {
      console.error('Storage stats error:', error);
      throw error;
    }
  }
} 