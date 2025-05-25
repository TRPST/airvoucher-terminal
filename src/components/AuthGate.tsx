"use client";

import { useEffect, useState } from "react";

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGate ensures that children only render after client-side hydration
 * This prevents SSR/hydration mismatches with Supabase components
 */
export function AuthGate({ children, fallback }: AuthGateProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect only runs on the client
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, show fallback or loading state
  if (!isClient) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      )
    );
  }

  // Only render children after client hydration
  return <>{children}</>;
} 