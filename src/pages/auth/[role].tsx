import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const { role } = router.query;
  const [loading, setLoading] = useState(true);

  // Handle redirect after successful authentication
  const handleAuthChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, redirecting to dashboard...");
        if (role) {
          await router.push(`/${role}`);
        }
      }
    },
    [role, router]
  );

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect to the appropriate dashboard
        if (role) {
          await router.push(`/${role}`);
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
      supabase.auth.onAuthStateChange(handleAuthChange);

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [role, router, handleAuthChange]);

  // Get proper title case role name for display
  const getRoleDisplay = () => {
    if (!role) return "Account";
    return role.toString().charAt(0).toUpperCase() + role.toString().slice(1);
  };

  if (loading) {
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

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(var(--primary))",
                    brandAccent: "hsl(var(--primary))",
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={role ? `/${role}` : "/"}
            showLinks={false}
            view="sign_in"
            magicLink={false}
            authOptions={{
              emailRedirectTo:
                window?.location?.origin + (role ? `/${role}` : "/"),
              emailAuth: {
                emailConfirmationRequired: false,
              },
              onSuccess: async (response: any) => {
                console.log("Auth success, redirecting...");
                if (role) {
                  await router.push(`/${role}`);
                }
              },
            }}
          />
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
