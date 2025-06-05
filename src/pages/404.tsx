import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DebugInfo } from '@/components/DebugInfo';

export default function Custom404() {
  const router = useRouter();
  const [path, setPath] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPath(window.location.pathname);
      setHostname(window.location.hostname);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">AirVoucher</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-6xl font-bold">404</h1>
          <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>

          <div className="mb-8 rounded-lg border border-border bg-card p-4 text-left">
            <p className="mb-2">
              <strong>Debug Info:</strong>
            </p>
            <p className="mb-1 font-mono text-sm">Path: {path}</p>
            <p className="mb-1 font-mono text-sm">Hostname: {hostname}</p>
            <p className="mb-1 font-mono text-sm">Router path: {router.asPath}</p>
          </div>

          <div className="space-y-4">
            <p>
              We couldn't find the page you're looking for. It might have been moved or no longer
              exists.
            </p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
              >
                Go Back
              </button>

              <Link
                href="/auth"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <DebugInfo />
    </div>
  );
}
