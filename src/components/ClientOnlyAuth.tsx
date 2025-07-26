"use client";

import { CustomAuth } from "./CustomAuth";

interface ClientOnlyAuthProps {
  role: string;
}

export function ClientOnlyAuth({ role }: ClientOnlyAuthProps) {
  if (!role) {
    return <div>Invalid portal access. Please return to the home page.</div>;
  }
  
  // Simple wrapper that just renders the auth form
  return <CustomAuth role={role} />;
} 