import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { getUserRole, signOutUser } from "@/actions/userActions";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { motion } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const { role } = router.query;
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [authKey, setAuthKey] = useState(0); // For forcing re-render

  // Ensure component only renders on client-side to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    // Initialize Supabase client only on client side
    try {
      const client = getSupabaseClient();
      setSupabaseClient(client);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
    }
  }, []);

  // Handler for retrying auth component
  const handleAuthRetry = useCallback(() => {
    console.log('Retrying auth component...');
    setAuthKey(prev => prev + 1);
  }, []);

  // Helper function to get user's role from profiles table using the action
  const getUserRoleFromProfile = async (userId: string) => {
    // Use the getUserRole action instead of directly querying supabase
    const { data, error } = await getUserRole(userId);
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return data;
  };

  // Handle redirect after successful authentication
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

  useEffect(() => {
    // Only proceed if we have a Supabase client
    if (!supabaseClient) return;

    // Check if user is already logged in and has the correct role
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session?.user?.id) {
        
        // Get user's role from profiles table
        const userRole = await getUserRoleFromProfile(data.session.user.id);
        console.log(`Existing session check - user role from profile: ${userRole}`);
        
        // Check if user has the required role
        if (role && userRole === role) {
          // User has correct role, redirect to dashboard
          await router.push(`/${role}`);
        } else if (role && userRole && userRole !== role) {
          // User has a different role, sign them out and stay on auth page
          console.log(`User has role ${userRole} but trying to access ${role} portal. Signing out.`);
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
          setLoading(false);
        } else if (!userRole) {
          // No role assigned, sign them out
          console.log("User has no assigned role in profile. Signing out.");
          const { error: signOutError } = await signOutUser();
          if (signOutError) {
            console.error("Error signing out:", signOutError);
          }
          setLoading(false);
        } else {
          // No role info, continue to auth page
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (role) {
      checkSession();
    } else {
      setLoading(false);
    }

    // Set up auth state change listener
    const { data: authListener } =
      supabaseClient.auth.onAuthStateChange(handleAuthChange);

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [role, router, handleAuthChange, supabaseClient]);

  // Get proper title case role name for display
  const getRoleDisplay = () => {
    if (!role) return "Account";
    return role.toString().charAt(0).toUpperCase() + role.toString().slice(1);
  };

  // Show loading until mounted and Supabase client is ready
  if (loading || !mounted || !supabaseClient) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "hsl(var(--background))",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "9999px",
            borderWidth: "2px",
            borderColor: "hsl(var(--primary))",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid hsla(var(--border), 0.4)",
          backgroundColor: "hsla(var(--background), 0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 1rem",
            height: "4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              fontSize: "0.875rem",
            }}
          >
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Portals
            </a>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%",
            maxWidth: "28rem",
            borderRadius: "0.75rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "2rem",
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {getRoleDisplay()} Portal
          </h2>

          <AuthErrorBoundary onRetry={handleAuthRetry}>
            <Auth
              key={authKey}
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
          </AuthErrorBoundary>
        </motion.div>
      </main>

      <footer
        style={{
          borderTop: "1px solid hsl(var(--border))",
          padding: "1.5rem 0",
        }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: "0.875rem",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            &copy; 2025 AirVoucher. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
