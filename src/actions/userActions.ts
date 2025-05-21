import supabase from "@/lib/supabaseClient";
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
    return { data: data?.role || null, error: null };
  } catch (err) {
    console.error("Unexpected error fetching user role:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Get a user's complete profile from the profiles table
 * @param userId The user's ID
 * @returns The user's profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<{
  data: UserProfile | null;
  error: PostgrestError | Error | null;
}> {
  try {
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
    await supabase.auth.signOut();
    return { error: null };
  } catch (err) {
    console.error("Error signing out:", err);
    return {
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
