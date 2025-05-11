import supabase from "@/lib/supabaseClient";
import {
  Retailer,
  RetailerData,
  ProfileData,
  CreateRetailerParams,
  ResponseType,
} from "../types/adminTypes";

/**
 * Fetch all retailers with their profile and agent information
 */
export async function fetchRetailers(): Promise<ResponseType<Retailer[]>> {
  try {
    console.log("Fetching retailers from Supabase");

    const { data, error } = await supabase.from("retailers").select(`
        id,
        name,
        contact_name,
        contact_email,
        balance,
        credit_limit,
        credit_used,
        commission_balance,
        status,
        agent_profile_id,
        commission_group_id,
        profiles!retailers_user_profile_id_fkey(full_name, email),
        agent_profiles:profiles!retailers_agent_profile_id_fkey(id, full_name),
        commission_groups(id, name)
      `);

    if (error) {
      console.error("Supabase error when fetching retailers:", error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      console.log("No retailers found in the database");
      // In development, return mock data for testing
      if (process.env.NODE_ENV === "development") {
        const mockRetailers: Retailer[] = [
          {
            id: "mock-retailer-1",
            name: "Dev Test Retailer",
            contact_name: "Dev Contact Person",
            contact_email: "contact@example.com",
            balance: 1000,
            credit_limit: 5000,
            credit_used: 200,
            commission_balance: 150,
            status: "active",
            full_name: "Dev User",
            email: "dev@example.com",
            agent_name: "Dev Agent",
            commission_group_name: "Standard",
            agent_profile_id: "mock-agent-1",
            commission_group_id: "mock-group-1",
          },
        ];
        return { data: mockRetailers, error: null };
      }

      return { data: [], error: null };
    }

    console.log(`Found ${data.length} retailers`);

    // Transform the data to match the Retailer type
    const retailers = data.map((retailer) => ({
      id: retailer.id,
      name: retailer.name,
      contact_name: retailer.contact_name || "",
      contact_email: retailer.contact_email || "",
      balance: retailer.balance || 0,
      credit_limit: retailer.credit_limit || 0,
      credit_used: retailer.credit_used || 0,
      commission_balance: retailer.commission_balance || 0,
      status: retailer.status as "active" | "suspended" | "inactive",
      full_name: retailer.profiles?.[0]?.full_name || "",
      email: retailer.profiles?.[0]?.email || "",
      agent_name: retailer.agent_profiles?.[0]?.full_name,
      commission_group_name: retailer.commission_groups?.[0]?.name,
      agent_profile_id: retailer.agent_profile_id, // Original field from retailer
      commission_group_id: retailer.commission_group_id, // Original field from retailer
    }));

    return { data: retailers, error: null };
  } catch (err) {
    console.error("Unexpected error in fetchRetailers:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

/**
 * Create a new retailer with a profile
 */
export async function createRetailer({
  profileData,
  retailerData,
  password,
}: CreateRetailerParams): Promise<ResponseType<{ id: string }>> {
  try {
    // First, create the Supabase auth user using signUp instead of admin API
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: profileData.email,
      password: password,
      options: {
        data: {
          role: "retailer",
        },
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return {
        data: null,
        error: new Error("Failed to create user in authentication system"),
      };
    }

    // Next, create the profile linked to the new user ID
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id, // Use the UUID from Supabase auth
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        role: "retailer",
      })
      .select("id")
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // We can't delete the auth user here as we don't have admin privileges
      // The user will remain in Auth but without a profile
      return { data: null, error: profileError };
    }

    // Finally, create the retailer
    const { data: retailer, error: retailerError } = await supabase
      .from("retailers")
      .insert({
        user_profile_id: profiles.id, // This should be the same as authData.user.id
        name: retailerData.name,
        contact_name: retailerData.contact_name,
        contact_email: retailerData.contact_email,
        location: retailerData.location,
        agent_profile_id: retailerData.agent_profile_id,
        commission_group_id: retailerData.commission_group_id,
        balance: retailerData.initial_balance || 0,
        credit_limit: retailerData.credit_limit || 0,
        status: retailerData.status || "active",
      })
      .select("id")
      .single();

    if (retailerError) {
      console.error("Error creating retailer:", retailerError);
      // We can't delete the auth user here without admin privileges
      // Just return the error to the client
      return { data: null, error: retailerError };
    }

    return { data: retailer, error: null };
  } catch (error) {
    console.error("Unexpected error in createRetailer:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Update an existing retailer
 */
export async function updateRetailer(
  id: string,
  updates: Partial<RetailerData>
): Promise<ResponseType<{ id: string }>> {
  const { data, error } = await supabase
    .from("retailers")
    .update(updates)
    .eq("id", id)
    .select("id")
    .single();

  return { data, error };
}
