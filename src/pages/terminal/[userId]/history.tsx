import * as React from "react";
import { History, Receipt, Clock, Hash, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

import {
  fetchTerminalProfile,
  type TerminalProfile,
  TerminalActions,
} from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

export default function TerminalHistory() {
  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole("terminal");
  const router = useRouter();

  // Get userId from URL parameters
  const userId = router.query.userId as string;

  // State for terminal data and sales history
  const [terminal, setTerminal] = React.useState<TerminalProfile | null>(null);
  const [salesHistory, setSalesHistory] = React.useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [dataError, setDataError] = React.useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterDateRange, setFilterDateRange] = React.useState<string>("all");

  // Fetch terminal data and sales history on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch terminal profile
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

        // Fetch sales history using user ID as terminal ID
        const { data: salesData, error: salesError } = await TerminalActions.fetchSalesHistory(userId);

        if (salesError) {
          setDataError(`Failed to load sales history: ${salesError.message}`);
          return;
        }

        setSalesHistory(salesData || []);
      } catch (err) {
        setDataError(
          `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-ZA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter sales based on search term and date range
  const filteredSales = React.useMemo(() => {
    if (!salesHistory) return [];

    let filtered = salesHistory;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((sale) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          sale.voucher_inventory?.voucher_types?.name?.toLowerCase().includes(searchLower) ||
          sale.voucher_inventory?.pin?.toLowerCase().includes(searchLower) ||
          sale.voucher_inventory?.serial_number?.toLowerCase().includes(searchLower) ||
          formatCurrency(sale.sale_amount).toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply date range filter
    if (filterDateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filterDateRange) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (filterDateRange !== "all") {
        filtered = filtered.filter((sale) => new Date(sale.created_at) >= filterDate);
      }
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [salesHistory, searchTerm, filterDateRange]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalSales = filteredSales.length;
    const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.sale_amount, 0);
    const totalCommission = filteredSales.reduce((sum, sale) => sum + sale.retailer_commission, 0);
    
    return {
      totalSales,
      totalAmount,
      totalCommission,
    };
  }, [filteredSales]);

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Sales History
        </h1>
        <p className="text-muted-foreground">
          View your terminal sales history and transactions for {terminal.name}.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{summaryStats.totalSales}</p>
            <p className="text-xs text-muted-foreground">
              {filterDateRange === "all" ? "All time" : `Last ${filterDateRange}`}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalAmount)}</p>
            <p className="text-xs text-muted-foreground">
              Sales revenue
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Commission</h3>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-green-500">{formatCurrency(summaryStats.totalCommission)}</p>
            <p className="text-xs text-muted-foreground">
              Your earnings
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-6">
          <h3 className="font-medium mb-4">Recent Transactions</h3>
          
          {filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No sales found</h4>
              <p className="text-muted-foreground text-sm">
                {searchTerm || filterDateRange !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Start selling vouchers to see your transaction history here."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {sale.voucher_inventory?.voucher_types?.name || "Unknown Voucher"}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(sale.created_at)}
                        </div>
                        {sale.voucher_inventory?.serial_number && (
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <code className="text-xs">
                              {sale.voucher_inventory.serial_number}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(sale.sale_amount)}</p>
                    <p className="text-sm text-green-500">
                      +{formatCurrency(sale.retailer_commission)} commission
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 