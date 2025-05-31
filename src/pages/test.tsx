import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [hostname, setHostname] = useState<string>('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 max-w-md">
        <p className="mb-2">This is a test page to verify routing.</p>
        <div className="text-sm font-mono bg-black/10 dark:bg-white/10 p-2 rounded">
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</p>
          <p>Hostname: {hostname}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Link 
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Return to Home
        </Link>
        <Link 
          href="/auth"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Go to Auth Page
        </Link>
      </div>
    </div>
  );
} 