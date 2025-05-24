import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import supabase from "@/lib/supabaseClient";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname.startsWith("/auth/");

  // Ensure component only renders on client-side to prevent hydration issues
  useEffect(() => {
    setMounted(true);
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
    return <div style={{ minHeight: "100vh", backgroundColor: "hsl(var(--background))" }} />;
  }

  return (
    <ThemeProvider attribute="class">
      <SessionContextProvider 
        supabaseClient={supabase}
        initialSession={pageProps.initialSession}
      >
        <ToastProvider>
          {isLandingPage || isAuthPage ? (
            <Component {...pageProps} />
          ) : (
            <Layout role={role}>
              <Component {...pageProps} />
            </Layout>
          )}
        </ToastProvider>
      </SessionContextProvider>
    </ThemeProvider>
  );
}
