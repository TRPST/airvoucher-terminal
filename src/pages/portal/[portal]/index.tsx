import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { VALID_PORTALS, type PortalType } from "@/utils/subdomain";
import Link from "next/link";

export default function PortalDashboard() {
  const router = useRouter();
  const { portal } = router.query;
  const [portalType, setPortalType] = useState<string | null>(null);
  
  // Set portal type once router is ready
  useEffect(() => {
    if (router.isReady && typeof portal === 'string') {
      setPortalType(portal);
    }
  }, [router.isReady, portal]);

  // Validate that the portal is one of our valid portal types
  const isValidPortal = portalType && VALID_PORTALS.includes(portalType as PortalType);

  // Redirect to home if portal is invalid
  useEffect(() => {
    if (router.isReady && !isValidPortal && portalType !== null) {
      router.push('/');
    }
  }, [router, isValidPortal, portalType]);

  // Redirect to portal-specific pages based on portal type
  useEffect(() => {
    if (router.isReady && portalType) {
      if (portalType === 'cashier') {
        router.push('/cashier');
      }
      // Add more redirects for other portal types if needed
    }
  }, [router, portalType]);

  // If portal is not valid or not yet loaded, show loading
  if (!isValidPortal) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Get proper title case portal name for display
  const getPortalDisplay = () => {
    if (!portalType) return "Dashboard";
    return portalType.charAt(0).toUpperCase() + portalType.slice(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              {getPortalDisplay()} Portal
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Sign out functionality would go here
                router.push('/auth');
              }}
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Welcome to the {getPortalDisplay()} Dashboard
          </h1>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="mb-4">
              This is a placeholder dashboard for the {getPortalDisplay()} portal.
              In a real application, this would display portal-specific content and features.
            </p>
            
            <p>
              You accessed this page through the {portalType}.baseUrl domain structure.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center text-sm text-muted-foreground">
            &copy; 2025 AirVoucher. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 