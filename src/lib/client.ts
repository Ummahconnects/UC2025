import { supabase } from '@/integrations/supabase/client';
import type { Profile, BusinessOwner, Individual, MosqueAdmin } from '@/types/client';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function getBusinessOwnerDetails(userId: string) {
  const { data, error } = await supabase
    .from('business_owners')
    .select(`
      *,
      profiles:user_id(*),
      businesses(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as BusinessOwner;
}

export async function getMosqueAdminDetails(userId: string) {
  const { data, error } = await supabase
    .from('mosque_admins')
    .select(`
      *,
      profiles:user_id(*),
      mosques(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as MosqueAdmin;
}

export async function getIndividualDetails(userId: string) {
  const { data, error } = await supabase
    .from('individuals')
    .select(`
      *,
      profiles:user_id(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Individual;
}

// Function to handle favoriting a business
export async function toggleFavoriteBusiness(userId: string, businessId: string) {
  const { data: individual, error: fetchError } = await supabase
    .from('individuals')
    .select('favorite_businesses')
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  const favorites = individual?.favorite_businesses || [];
  const newFavorites = favorites.includes(businessId)
    ? favorites.filter((id: string) => id !== businessId)
    : [...favorites, businessId];

  const { error: updateError } = await supabase
    .from('individuals')
    .update({ favorite_businesses: newFavorites })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return newFavorites;
}

// Function to handle favoriting a mosque
export async function toggleFavoriteMosque(userId: string, mosqueId: string) {
  const { data: individual, error: fetchError } = await supabase
    .from('individuals')
    .select('favorite_mosques')
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  const favorites = individual?.favorite_mosques || [];
  const newFavorites = favorites.includes(mosqueId)
    ? favorites.filter((id: string) => id !== mosqueId)
    : [...favorites, mosqueId];

  const { error: updateError } = await supabase
    .from('individuals')
    .update({ favorite_mosques: newFavorites })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return newFavorites;
}
