"use client";

import { useState, useEffect, useCallback } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getUserRole, signOutUser } from "@/actions/userActions";
import { useRouter } from "next/router";

interface ClientOnlyAuthProps {
  role: string;
}

export function ClientOnlyAuth({ role }: ClientOnlyAuthProps) {
  const router = useRouter();
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Supabase client on mount
  useEffect(() => {
    try {
      const client = getSupabaseClient();
      setSupabaseClient(client);
      setIsReady(true);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setIsReady(true); // Still set ready to show error state
    }
  }, []);

  // Helper function to get user's role from profiles table
  const getUserRoleFromProfile = async (userId: string) => {
    const { data, error } = await getUserRole(userId);
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data;
  };

  // Handle authentication state changes
  const handleAuthChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, checking role...");
        
        if (!session.user?.id) {
          console.error("No user ID found in session");
          return;
        }
        
        // Get user's role from profiles table
        const userRole = await getUserRoleFromProfile(session.user.id);
        console.log(`User role from profiles table: ${userRole}`);
        
        if (userRole && role) {
          if (userRole === role) {
            // Role matches, redirect to dashboard
            console.log(`User has correct role (${userRole}), redirecting to dashboard...`);
            await router.push(`/${role}`);
          } else {
            // Role doesn't match, sign them out
            console.log(`User has role ${userRole} but trying to access ${role} portal. Access denied.`);
            const { error: signOutError } = await signOutUser();
            if (signOutError) {
              console.error("Error signing out:", signOutError);
            }
            alert(`Access denied. You don't have permission to access the ${role} portal.`);
          }
        } else if (!userRole) {
          // No role found in profiles table
          console.log("No role found in user profile. Access denied.");
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
          alert("Your account doesn't have access permissions. Please contact an administrator.");
        }
      }
    },
    [role, router]
  );

  // Set up auth listener
  useEffect(() => {
    if (!supabaseClient || !isReady) return;

    // Check existing session
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session?.user?.id) {
        const userRole = await getUserRoleFromProfile(data.session.user.id);
        console.log(`Existing session check - user role from profile: ${userRole}`);
        
        if (role && userRole === role) {
          await router.push(`/${role}`);
        } else if (role && userRole && userRole !== role) {
          console.log(`User has role ${userRole} but trying to access ${role} portal. Signing out.`);
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
        } else if (!userRole) {
          console.log("User has no assigned role in profile. Signing out.");
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
        }
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(handleAuthChange);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, isReady, role, router, handleAuthChange]);

  // Show loading state until ready
  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show error state if no client
  if (!supabaseClient) {
    return (
      <div className="text-center p-6 text-destructive">
        <p>Failed to initialize authentication. Please reload the page.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <Auth
      supabaseClient={supabaseClient}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              brand: "hsl(var(--primary))",
              brandAccent: "hsl(var(--primary))",
            },
          },
          dark: {
            colors: {
              inputText: "white",
              inputBackground: "hsl(var(--card))",
              inputBorder: "hsl(var(--border))",
              inputLabelText: "hsl(var(--foreground))",
              inputPlaceholder: "hsl(var(--muted-foreground))",
            },
          },
        },
        style: {
          input: {
            color: "var(--foreground)",
          },
        },
      }}
      providers={[]}
      redirectTo={role ? `/${role}` : "/"}
      showLinks={false}
      view="sign_in"
      magicLink={false}
    />
  );
} 