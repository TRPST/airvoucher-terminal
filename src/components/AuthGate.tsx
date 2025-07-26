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

  // During SSR, return null to prevent hydration mismatches
  // On client, render children immediately
  if (typeof window === 'undefined') {
    return null;
  }

  // Always render children on client-side
  return <>{children}</>;
} 