import * as React from "react";
import { User, Computer, Store, Calendar, Shield, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

import {
  fetchTerminalProfile,
  type TerminalProfile,
} from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

export default function TerminalAccount() {
  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole("terminal");
  const router = useRouter();

  // Get userId from URL parameters
  const userId = router.query.userId as string;

  // State for terminal data
  const [terminal, setTerminal] = React.useState<TerminalProfile | null>(null);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [dataError, setDataError] = React.useState<string | null>(null);

  // Fetch terminal data on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized || !user) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch terminal profile using user ID
        const { data: terminalData, error: terminalError } = await fetchTerminalProfile(userId);

        if (terminalError) {
          setDataError(`Failed to load terminal profile: ${terminalError.message}`);
          return;
        }

        if (!terminalData) {
          setDataError("No terminal profile found");
          return;
        }

        setTerminal(terminalData);
      } catch (err) {
        setDataError(
          `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized, user]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{dataError}</p>
        </div>
      </div>
    );
  }

  if (!terminal) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Terminal Not Found</h2>
          <p className="text-muted-foreground">Unable to load terminal information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Account Information</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Terminal Information Card */}
        <motion.div
          className="col-span-1 rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Computer className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{terminal.name}</h3>
                <p className="text-sm text-muted-foreground">Terminal ID: {terminal.id}</p>
                <div className="mt-3 flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Active since {formatDate(terminal.created_at)}</span>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Shield className="mr-2 h-4 w-4" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    terminal.status === 'active'
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {terminal.status === 'active' ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Retailer Information Card */}
        <motion.div
          className="col-span-1 rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <Store className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{terminal.retailer_name || "Unknown Retailer"}</h3>
                <p className="text-sm text-muted-foreground">Associated Retailer</p>
                <div className="mt-3 flex items-center text-sm text-muted-foreground">
                  <span>Balance: {formatCurrency(terminal.retailer_balance || 0)}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <span>Commission: {formatCurrency(terminal.retailer_commission_balance || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Details Card */}
        <motion.div
          className="col-span-full rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Terminal Name</label>
                <p className="text-sm">{terminal.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Terminal ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{terminal.id}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Retailer</label>
                <p className="text-sm">{terminal.retailer_name || "Unknown"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    terminal.status === 'active'
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {terminal.status === 'active' ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-sm">{formatDate(terminal.created_at)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User Email</label>
                <p className="text-sm">{user?.email || "Not available"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Summary Card */}
        <motion.div
          className="col-span-full rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(terminal.retailer_balance || 0)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Credit Limit</p>
                <p className="text-2xl font-bold">{formatCurrency(terminal.retailer_credit_limit || 0)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Credit Used</p>
                <p className="text-2xl font-bold">{formatCurrency(terminal.retailer_credit_used || 0)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <p className="text-sm text-muted-foreground">Commission Balance</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(terminal.retailer_commission_balance || 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 