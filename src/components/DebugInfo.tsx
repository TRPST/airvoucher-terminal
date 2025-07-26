"use client";

import { useState, useEffect } from "react";

interface DebugInfoProps {
  show?: boolean;
}

export function DebugInfo({ show = true }: DebugInfoProps) {
  const [hostname, setHostname] = useState<string>("");
  const [pathname, setPathname] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
      setPathname(window.location.pathname);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs font-mono z-50 max-w-md overflow-auto">
      <div className="mb-2 font-bold">Debug Info:</div>
      <div>Hostname: {hostname}</div>
      <div>Path: {pathname}</div>
      <div>Window Location: {typeof window !== "undefined" ? window.location.href : "N/A"}</div>
    </div>
  );
} 