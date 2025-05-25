import { getSupabaseClient } from "@/lib/supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  role: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
};

/**
 * Get a user's role from the profiles table
 * @param userId The user's ID
 * @returns The user's role or null if not found
 */
export async function getUserRole(userId: string): Promise<{
  data: string | null;
  error: PostgrestError | Error | null;
}> {
  try {
    // Only proceed if we're on the client side
    if (typeof window === 'undefined') {
      return { data: null, error: new Error('getUserRole can only be called on the client side') };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') };
    }

    // Get user's role from the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return { data: null, error };
    }
    
    console.log("User profile data:", data);
    return { data: data?.role as string || null, error: null };
  } catch (err) {
    console.error("Unexpected error fetching user role:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Get a user's full profile from the profiles table
 * @param userId The user's ID
 * @returns The user's profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<{
  data: UserProfile | null;
  error: PostgrestError | Error | null;
}> {
  try {
    // Only proceed if we're on the client side
    if (typeof window === 'undefined') {
      return { data: null, error: new Error('getUserProfile can only be called on the client side') };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: null, error: new Error('Supabase client not available') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return { data: null, error };
    }
    
    return { data: data as UserProfile, error: null };
  } catch (err) {
    console.error("Unexpected error fetching user profile:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<{
  error: Error | null;
}> {
  try {
    // Only proceed if we're on the client side
    if (typeof window === 'undefined') {
      return { error: new Error('signOutUser can only be called on the client side') };
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase client not available') };
    }

    await supabase.auth.signOut();
    return { error: null };
  } catch (err) {
    console.error("Error signing out:", err);
    return {
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
