// Type definitions for supabase-unified.js

import { SupabaseClient } from '@supabase/supabase-js';

// Mosque data interface
export interface MosqueData {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

// Business data interface
export interface BusinessData {
  id: string;
  name?: string;
  business_name?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  business_type?: string;
  lat?: number;
  lng?: number;
  created_at: string;
}

// Search results interface
export interface SearchResults {
  mosques: MosqueData[];
  businesses: BusinessData[];
  total: number;
  totalRecords: {
    mosques: number;
    businesses: number;
    combined: number;
  };
}

// Total counts interface
export interface TotalCounts {
  mosques: number;
  businesses: number;
  total: number;
}

// Function declarations
export declare function getMosques(
  limit?: number,
  offset?: number,
  searchQuery?: string
): Promise<MosqueData[]>;

export declare function getBusinesses(
  limit?: number,
  offset?: number,
  searchQuery?: string
): Promise<BusinessData[]>;

export declare function searchAllEntities(
  searchQuery: string,
  limit?: number
): Promise<SearchResults>;

export declare function getTotalCounts(): Promise<TotalCounts>;

// Default export
declare const supabase: SupabaseClient;
export default supabase;