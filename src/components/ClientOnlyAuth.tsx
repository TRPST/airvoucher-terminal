"use client";

import { CustomAuth } from "./CustomAuth";

interface ClientOnlyAuthProps {
  role: string;
}

export function ClientOnlyAuth({ role }: ClientOnlyAuthProps) {
  // Simple wrapper that just renders the auth form
  return <CustomAuth role={role} />;
} 