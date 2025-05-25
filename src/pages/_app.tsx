import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname.startsWith("/auth/");

  // Ensure component only renders on client-side to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    // Initialize Supabase client only on client side
    try {
      const client = getSupabaseClient();
      setSupabaseClient(client);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setClientError(error instanceof Error ? error.message : 'Failed to initialize Supabase client');
    }
  }, []);

  // Determine user role based on URL path
  let role: "admin" | "retailer" | "agent" = "admin";
  if (router.pathname.startsWith("/retailer")) {
    role = "retailer";
  } else if (router.pathname.startsWith("/agent")) {
    role = "agent";
  }

  // Show loading state until mounted on client-side and Supabase is ready
  if (!mounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: "hsl(var(--background))" }} />;
  }

  // Show error if Supabase client failed to initialize
  if (clientError) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "hsl(var(--background))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "hsl(var(--destructive))", textAlign: "center" }}>
          <h1>Application Error</h1>
          <p>{clientError}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: "1rem", padding: "0.5rem 1rem", border: "1px solid", borderRadius: "0.375rem" }}>
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Don't render SessionContextProvider until we have a valid client
  if (!supabaseClient) {
    return <div style={{ minHeight: "100vh", backgroundColor: "hsl(var(--background))" }} />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class">
        <ErrorBoundary>
          <SessionContextProvider 
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
          >
            <ErrorBoundary>
              <ToastProvider>
                <ErrorBoundary>
                  {isLandingPage || isAuthPage ? (
                    <Component {...pageProps} />
                  ) : (
                    <Layout role={role}>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                </ErrorBoundary>
              </ToastProvider>
            </ErrorBoundary>
          </SessionContextProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
