import { useRouter } from "next/router";
import { AuthGate } from "@/components/AuthGate";
import { ClientOnlyAuth } from "@/components/ClientOnlyAuth";
import { motion } from "framer-motion";
import { VALID_PORTALS, type PortalType, getCurrentPortal } from "@/utils/subdomain";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DebugInfo } from "@/components/DebugInfo";

export default function PortalAuthPage() {
  const router = useRouter();
  const { portal } = router.query;
  const [portalType, setPortalType] = useState<string | null>(null);
  const [hostname, setHostname] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the hostname and derive portal type on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentHostname = window.location.hostname;
      setHostname(currentHostname);
      
      // Try to detect portal from subdomain first
      const subdomainPortal = getCurrentPortal(currentHostname);
      
      if (subdomainPortal) {
        console.log("Portal detected from subdomain:", subdomainPortal);
        setPortalType(subdomainPortal);
      } else if (router.isReady && typeof portal === 'string') {
        console.log("Portal from router query:", portal);
        setPortalType(portal);
      }
      
      setIsLoading(false);
    }
  }, [router.isReady, portal]);
  
  // Validate that the portal is one of our valid portal types
  const isValidPortal = portalType && VALID_PORTALS.includes(portalType as PortalType);

  // Get proper title case portal name for display
  const getPortalDisplay = () => {
    if (!portalType) return "Account";
    return portalType.charAt(0).toUpperCase() + portalType.slice(1);
  };

  // Always show a consistent UI first to prevent hydration errors
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no valid portal is detected, show a helpful error
  if (!isValidPortal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
        <h1 className="text-2xl font-bold mb-4">Portal Configuration Error</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 max-w-md">
          <p className="mb-2">Unable to determine the correct portal. Please check your URL configuration.</p>
          <div className="text-sm font-mono bg-black/10 dark:bg-white/10 p-2 rounded">
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</p>
            <p>Detected Portal: {portalType || 'None'}</p>
            <p>Hostname: {hostname}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Home
          </Link>
        </div>
        <DebugInfo />
      </div>
    );
  }

  // Once we have a valid portal, show the auth form
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
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
              Back to Home
            </Link>
          </div>
          <span className="text-sm font-medium">{getPortalDisplay()} Portal</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-xl shadow-lg p-8 bg-card border border-border"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {getPortalDisplay()} Portal Login
          </h2>

          <AuthGate>
            <ClientOnlyAuth role={portalType} />
          </AuthGate>
        </motion.div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center text-sm text-muted-foreground">
            &copy; 2025 AirVoucher. All rights reserved.
          </div>
        </div>
      </footer>
      
      <DebugInfo />
    </div>
  );
} 