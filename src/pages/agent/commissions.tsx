import * as React from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import useRequireRole from "@/hooks/useRequireRole";
import {
  fetchAgentStatements,
  fetchAgentSummary,
  type AgentStatement,
} from "@/actions";

export default function AgentCommissions() {
  // Protect this route - only allow agent role
  const { isLoading: isLoadingAuth, user, isAuthorized } = useRequireRole("agent");
  
  const [filter, setFilter] = React.useState<"pending" | "paid">("pending");
  const [dateRange, setDateRange] = React.useState<
    "all" | "mtd" | "past30" | "past90"
  >("mtd");
  const [statements, setStatements] = React.useState<AgentStatement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState({
    total: 0,
    pending: 0,
    paid: 0,
    count: 0,
  });

  // Fetch agent statements
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Get the actual user ID from auth instead of using "current"
        if (!user?.id) {
          console.error("No user ID available");
          return;
        }

        const agentId = user.id;

        // Get date range for filtering
        const startDate = getDateRangeStart(dateRange);

        // Fetch statements
        const { data: statementsData, error: statementsError } =
          await fetchAgentStatements(agentId, {
            startDate: startDate ? startDate.toISOString() : undefined,
          });

        if (statementsError) {
          throw new Error(
            `Failed to load statements: ${statementsError.message}`
          );
        }

        setStatements(statementsData || []);

        // Get summary data
        const { data: summaryData, error: summaryError } =
          await fetchAgentSummary(agentId);

        if (summaryError) {
          console.error("Error loading summary:", summaryError);
          // Continue without summary data
        } else if (summaryData) {
          // For demo purposes, split the commission between pending and paid
          // In a real app, this would come from the backend
          const pending = summaryData.mtd_commission * 0.4;
          const paid = summaryData.mtd_commission - pending;

          setSummary({
            total: summaryData.mtd_commission,
            pending,
            paid,
            count: statementsData?.length || 0,
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load commission data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!isLoadingAuth && isAuthorized && user?.id) {
      loadData();
    }
  }, [dateRange, isLoadingAuth, isAuthorized, user?.id]);

  // Helper function to get start date based on filter
  function getDateRangeStart(
    range: "all" | "mtd" | "past30" | "past90"
  ): Date | null {
    const now = new Date();

    switch (range) {
      case "mtd":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "past30":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return thirtyDaysAgo;
      case "past90":
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return ninetyDaysAgo;
      case "all":
      default:
        return null; // No date filtering
    }
  }

  // Apply filters
  const filteredStatements = React.useMemo(() => {
    // In a real app, we'd have a proper "pending" vs "paid" flag
    // For demo purposes, we'll consider 40% of transactions as pending
    const pendingCount = Math.floor(statements.length * 0.4);
    const pendingStatements = statements.slice(0, pendingCount);
    const paidStatements = statements.slice(pendingCount);

    return filter === "pending" ? pendingStatements : paidStatements;
  }, [statements, filter]);

  // Prepare table data
  const tableData = React.useMemo(() => {
    return filteredStatements.map((statement) => {
      // Format date
      const statementDate = new Date(statement.created_at);
      const formattedDate = statementDate.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        Date: formattedDate,
        Retailer: statement.retailer_name || "Unknown Retailer",
        Type: statement.type || "Transaction",
        Value: `R ${statement.amount.toFixed(2)}`,
        Notes: statement.notes || "-",
        Status:
          filter === "pending" ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500">
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
              Paid
            </span>
          ),
      };
    });
  }, [filteredStatements, filter]);

  // Loading state
  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading commission data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Error</h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Commission Statement
        </h1>
        <p className="text-muted-foreground">
          Track your earnings and commission from retailer sales.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="Total Commission"
          value={`R ${summary.total.toFixed(2)}`}
          icon={TrendingUp}
          intent="info"
          subtitle={`${summary.count} transactions`}
        />
        <StatsTile
          label="Paid Commission"
          value={`R ${summary.paid.toFixed(2)}`}
          icon={DollarSign}
          intent="success"
          subtitle="Already paid out"
        />
        <StatsTile
          label="Pending Commission"
          value={`R ${summary.pending.toFixed(2)}`}
          icon={Calendar}
          intent="warning"
          subtitle="Will be paid on next cycle"
        />
      </div>

      {/* Filter controls */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Pending</div>
            <button
              onClick={() =>
                setFilter(filter === "pending" ? "paid" : "pending")
              }
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === "paid" ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                  filter === "paid" ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
            <div className="text-sm font-medium">Paid</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={dateRange}
            onChange={(e) =>
              setDateRange(
                e.target.value as "all" | "mtd" | "past30" | "past90"
              )
            }
          >
            <option value="mtd">Month to Date</option>
            <option value="past30">Past 30 Days</option>
            <option value="past90">Past 90 Days</option>
            <option value="all">All Time</option>
          </select>

          <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Table of transactions */}
      <div>
        <TablePlaceholder
          columns={["Date", "Retailer", "Type", "Value", "Notes", "Status"]}
          data={tableData}
          emptyMessage={`No ${
            filter === "pending" ? "pending" : "paid"
          } commissions found for the selected date range.`}
        />
      </div>
    </div>
  );
}
