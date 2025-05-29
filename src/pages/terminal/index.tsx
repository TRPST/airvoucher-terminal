import * as React from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Computer, ArrowRight } from "lucide-react";

import useRequireRole from "@/hooks/useRequireRole";

export default function TerminalLanding() {
  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole("terminal");
  const router = useRouter();

  // Redirect to user-specific terminal once authorized
  React.useEffect(() => {
    if (isAuthorized && user?.id) {
      // Redirect to the user's terminal
      router.replace(`/terminal/${user.id}`);
    }
  }, [isAuthorized, user?.id, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show temporary landing page while redirecting
  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Computer className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Terminal Portal</h1>
        <p className="text-muted-foreground mb-6">
          Redirecting you to your terminal...
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Loading terminal</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </motion.div>
    </div>
  );
} 