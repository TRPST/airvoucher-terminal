import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CatchAllPortal() {
  const router = useRouter();
  const { portal } = router.query;
  
  useEffect(() => {
    // If it's not the cashier portal, redirect to cashier auth
    if (portal !== 'cashier') {
      router.replace('/portal/cashier/auth');
    } else if (router.asPath === '/portal/cashier') {
      // If it's the cashier portal root, redirect to dashboard
      router.replace('/portal/cashier/dashboard');
    }
  }, [router, portal]);
  
  // Show a simple loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
} 