"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { getUserRole, signOutUser } from "@/actions/userActions";
import { useRouter } from "next/router";
import { CustomAuth } from "./CustomAuth";

interface ClientOnlyAuthProps {
  role: string;
}

export function ClientOnlyAuth({ role }: ClientOnlyAuthProps) {
  const router = useRouter();
  const [supabaseClient] = useState(() => createClient());
  const [isLoading, setIsLoading] = useState(true);

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
      console.log("Auth state changed:", event, session?.user?.id);
      
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
            // Note: Error display is now handled in CustomAuth component
          }
        } else if (!userRole) {
          // No role found in profiles table
          console.log("No role found in user profile. Access denied.");
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
          // Note: Error display is now handled in CustomAuth component
        }
      }
      
      if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
      
      setIsLoading(false);
    },
    [role, router]
  );

  // Set up auth listener
  useEffect(() => {
    // Check existing session
    const checkSession = async () => {
      console.log("Checking existing session...");
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

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
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(handleAuthChange);

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabaseClient, role, router, handleAuthChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return <CustomAuth role={role} />;
} 