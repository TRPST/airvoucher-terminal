import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentPortal, VALID_PORTALS, type PortalType } from '@/utils/subdomain';
import { DebugInfo } from '@/components/DebugInfo';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentHostname, setCurrentHostname] = useState('');
  const [portalType, setPortalType] = useState<PortalType | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setCurrentHostname(hostname);
      
      const portal = getCurrentPortal(hostname);
      setPortalType(portal);
      
      console.log('Auth Page - Hostname:', hostname);
      console.log('Auth Page - Detected Portal:', portal);
      
      // If we have a valid portal, redirect to the specific portal auth page
      if (portal) {
        console.log(`Redirecting to /portal/${portal}/auth`);
        router.push(`/portal/${portal}/auth`);
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <h1 className="text-2xl font-bold mb-4">Portal Configuration Issue</h1>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 max-w-md">
        <p className="mb-2">This page should be accessed through a proper subdomain.</p>
        <p className="mb-4">Please use one of the following URLs:</p>
        <ul className="list-disc pl-5 mb-2 space-y-1">
          {VALID_PORTALS.map(portal => (
            <li key={portal}>
              <code className="bg-black/10 dark:bg-white/10 px-1 rounded">
                http://{portal}.localhost:3000/auth
              </code>
            </li>
          ))}
        </ul>
        <div className="text-sm font-mono bg-black/10 dark:bg-white/10 p-2 rounded mt-4">
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</p>
          <p>Hostname: {currentHostname}</p>
          <p>Detected Portal: {portalType || 'None'}</p>
        </div>
      </div>
      <DebugInfo />
    </div>
  );
} 