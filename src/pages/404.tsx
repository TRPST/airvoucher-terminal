import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { DebugInfo } from "@/components/DebugInfo";

export default function Custom404() {
  const router = useRouter();
  const [path, setPath] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname);
      setHostname(window.location.hostname);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">AirVoucher</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
          
          <div className="mb-8 p-4 bg-card border border-border rounded-lg text-left">
            <p className="mb-2"><strong>Debug Info:</strong></p>
            <p className="mb-1 text-sm font-mono">Path: {path}</p>
            <p className="mb-1 text-sm font-mono">Hostname: {hostname}</p>
            <p className="mb-1 text-sm font-mono">Router path: {router.asPath}</p>
          </div>
          
          <div className="space-y-4">
            <p>
              We couldn't find the page you're looking for. It might have been moved or no longer exists.
            </p>
            
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium"
              >
                Go Back
              </button>
              
              <Link
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium"
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