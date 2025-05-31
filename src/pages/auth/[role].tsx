import { useRouter } from "next/router";
import { useEffect } from "react";
import { redirectToPortal, type PortalType, VALID_PORTALS } from "@/utils/subdomain";

export default function LegacyAuthPage() {
  const router = useRouter();
  const { role } = router.query;

  useEffect(() => {
    // Only run this on the client side
    if (typeof window === 'undefined' || !router.isReady) return;
    
    // Check if the role is valid
    if (role && typeof role === 'string' && VALID_PORTALS.includes(role as PortalType)) {
      // Redirect to the appropriate subdomain portal
      redirectToPortal(role as PortalType, '/auth');
    } else {
      // If invalid role, redirect to home
      router.push('/');
    }
  }, [router.isReady, role, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Redirecting to portal...</p>
      </div>
    </div>
  );
}
