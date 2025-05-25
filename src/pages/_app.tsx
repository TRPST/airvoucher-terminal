import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Layout } from "@/components/Layout";
import { AuthGate } from "@/components/AuthGate";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname.startsWith("/auth/");

  // Ensure component only renders on client-side
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

  // Determine user role based on URL path
  let role: "admin" | "retailer" | "agent" = "admin";
  if (router.pathname.startsWith("/retailer")) {
    role = "retailer";
  } else if (router.pathname.startsWith("/agent")) {
    role = "agent";
  }

  // Show loading state until mounted on client-side
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // For auth pages, render without SessionContextProvider to avoid hydration issues
  if (isAuthPage) {
    return (
      <ThemeProvider attribute="class">
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  // For landing page, render without SessionContextProvider
  if (isLandingPage) {
    return (
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }

  // For protected pages, use AuthGate with SessionContextProvider
  if (!supabaseClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class">
      <AuthGate>
        <SessionContextProvider 
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <ToastProvider>
            <Layout role={role}>
              <Component {...pageProps} />
            </Layout>
          </ToastProvider>
        </SessionContextProvider>
      </AuthGate>
    </ThemeProvider>
  );
}
