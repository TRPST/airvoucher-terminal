import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client with anon key for regular operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const createSupabaseClient = () => {
  // Only create client on the browser side
  if (typeof window === 'undefined') {
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'airvoucher-auth',
      storage: window.localStorage,
    },
    // Enable real-time only on client-side
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseInstance;
};

// Export a getter function instead of the client directly
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used on the client side');
  }
  return createSupabaseClient();
};

// Create a proxy object that throws helpful error for SSR
const createSupabaseProxy = () => {
  if (typeof window === 'undefined') {
    // Return a proxy that throws an error when any property is accessed during SSR
    return new Proxy({}, {
      get() {
        throw new Error('Supabase client accessed during server-side rendering. Use getSupabaseClient() in useEffect or client-side code only.');
      }
    });
  }
  return createSupabaseClient();
};

// For backwards compatibility, but will throw clear error if used during SSR
export const supabase = createSupabaseProxy() as ReturnType<typeof createClient>;

// IMPORTANT: Service role key should NEVER be exposed to the client
// This should only be used in API routes or server-side code
// Remove this from client-side code and use API routes instead
// const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// });

export default supabase;
