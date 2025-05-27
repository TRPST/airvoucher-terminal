import * as React from "react";
import { Calendar, Search, Filter, AlertCircle, BarChart2, PieChart } from "lucide-react";
import { motion } from "framer-motion";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import { cn } from "@/utils/cn";
import {
  fetchMyRetailer,
  fetchSalesHistory,
  fetchTerminals,
  type RetailerProfile,
  type Sale,
  type Terminal,
} from "@/actions/retailerActions";
import useRequireRole from "@/hooks/useRequireRole";

// Define tab types for date filtering
type DateFilter = "today" | "week" | "month" | "all";
type TerminalFilter = "all" | string;

export default function RetailerHistory() {
  // Protect this route - only allow retailer role
  const { isLoading, user, isAuthorized } = useRequireRole("retailer");

  // Get the current user ID
  const userId = user?.id;

  // State for retailer data and loading/error states
  const [retailer, setRetailer] = React.useState<RetailerProfile | null>(null);
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [terminals, setTerminals] = React.useState<Terminal[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [dataError, setDataError] = React.useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = React.useState<DateFilter>("week");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTerminal, setActiveTerminal] = React.useState<TerminalFilter>("all");
  const [showFilters, setShowFilters] = React.useState(false);

  // Fetch retailer data and sales history
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch retailer profile
        const { data: retailerData, error: retailerError } =
          await fetchMyRetailer(userId);

        if (retailerError) {
          setDataError(
            `Failed to load retailer profile: ${retailerError.message}`
          );
          return;
        }

        if (!retailerData) {
          setDataError("No retailer profile found for this user");
          return;
        }

        setRetailer(retailerData);

        // Determine date range based on active tab
        const now = new Date();
        let startDate: Date | undefined;

        if (activeTab === "today") {
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
        } else if (activeTab === "week") {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
        } else if (activeTab === "month") {
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
        }

        // Fetch terminals for this retailer
        const { data: terminalsData, error: terminalsError } =
          await fetchTerminals(retailerData.id);

        if (terminalsError) {
          setDataError(`Failed to load terminals: ${terminalsError.message}`);
          return;
        }

        setTerminals(terminalsData || []);

        // Get terminal IDs for this retailer
        const terminalIds = terminalsData?.map((terminal: Terminal) => terminal.id) || [];

        // Determine terminal ID filter
        const terminalId = activeTerminal !== "all" ? activeTerminal : undefined;

        // Fetch sales history with filters
        const { data: salesData, error: salesError } = await fetchSalesHistory({
          terminalId,
          startDate: startDate?.toISOString(),
        });

        if (salesError) {
          setDataError(`Failed to load sales history: ${salesError.message}`);
          return;
        }

        setSales(salesData || []);
      } catch (err) {
        setDataError(
          `Unexpected error: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized, activeTab, activeTerminal]);

  // Get filtered sales based on all active filters
  const filteredSales = React.useMemo(() => {
    let retailerSales = [...sales];

    // Apply date filter
    const now = new Date();
    if (activeTab === "today") {
      const today = now.toISOString().split("T")[0];
      retailerSales = retailerSales.filter((sale) =>
        sale.created_at.startsWith(today)
      );
    } else if (activeTab === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      retailerSales = retailerSales.filter(
        (sale) => new Date(sale.created_at) >= oneWeekAgo
      );
    } else if (activeTab === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      retailerSales = retailerSales.filter(
        (sale) => new Date(sale.created_at) >= oneMonthAgo
      );
    }

    // Apply terminal filter
    if (activeTerminal !== "all") {
      // Find terminal name for the selected ID
      const terminal = terminals.find(term => term.id === activeTerminal);
      if (terminal) {
        retailerSales = retailerSales.filter(
          (sale) => sale.terminal_name === terminal.name
        );
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      retailerSales = retailerSales.filter(
        (sale) =>
          sale.voucher_type.toLowerCase().includes(term) ||
          (sale.pin && sale.pin.includes(term)) ||
          (sale.serial_number && sale.serial_number.includes(term))
      );
    }

    return retailerSales;
  }, [sales, activeTab, searchTerm, activeTerminal, terminals]);

  // Format table data
  const tableData = React.useMemo(() => {
    console.log('filteredSales', filteredSales);
    return filteredSales.map((sale) => ({
      Date: new Date(sale.created_at).toLocaleString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      Type: (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              sale.voucher_type === "Mobile"
                ? "bg-primary"
                : sale.voucher_type === "OTT"
                ? "bg-purple-500"
                : sale.voucher_type === "Hollywoodbets"
                ? "bg-green-500"
                : sale.voucher_type === "Ringa"
                ? "bg-amber-500"
                : "bg-pink-500"
            )}
          />
          <span>{sale.voucher_type || "Unknown"}</span>
        </div>
      ),
      Value: `R ${(sale.voucher_amount || sale.sale_amount).toFixed(2)}`,
      Commission: `R ${sale.retailer_commission.toFixed(2)}`,
      "Reference": sale.ref_number || `REF-${sale.id.slice(0,8)}`,
    }));
  }, [filteredSales]);

  // Show loading state while checking authentication or loading data
  if (isLoading || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state if any
  if (dataError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Error Loading Data</h2>
        <p className="max-w-md text-muted-foreground">{dataError}</p>
      </div>
    );
  }

  // If retailer data hasn't loaded, show appropriate message
  if (!retailer) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-amber-500/10 p-3 text-amber-500">
          <Calendar className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Account Not Found</h2>
        <p className="max-w-md text-muted-foreground">
          We couldn't find your retailer account. Please contact support for
          assistance.
        </p>
      </div>
    );
  }

  // Date filter tabs
  const tabs = [
    { id: "today", label: "Today" },
    { id: "week", label: "Last 7 Days" },
    { id: "month", label: "Last 30 Days" },
    { id: "all", label: "All Time" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Sales History
        </h1>
        <p className="text-muted-foreground">
          View your sales history and transaction details.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Date Filter Tabs */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DateFilter)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search transactions..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm",
              showFilters 
                ? "bg-primary text-primary-foreground border-primary" 
                : "border-input bg-background hover:bg-muted"
            )}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Terminal Filter */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <h3 className="mb-3 font-medium">Filter Options</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="terminalFilter" className="mb-1 block text-sm font-medium">
                Terminal
              </label>
              <select
                id="terminalFilter"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={activeTerminal}
                onChange={(e) => setActiveTerminal(e.target.value)}
              >
                <option value="all">All Terminals</option>
                {terminals.map((terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      {filteredSales.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ChartPlaceholder
            title="Sales Over Time"
            description="Daily sales trend for the past 30 days"
            icon={<BarChart2 className="mb-3 h-12 w-12 opacity-20" />}
          />
          <ChartPlaceholder
            title="Sales by Voucher Type"
            description="Distribution of sales by voucher category"
            icon={<PieChart className="mb-3 h-12 w-12 opacity-20" />}
          />
        </div>
      )}

      {/* Transactions Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
              <p className="text-2xl font-semibold">{filteredSales.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-semibold">
                R{" "}
                {filteredSales
                  .reduce((sum, sale) => sum + sale.voucher_amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m8 12 3 3 5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earned Commission</p>
              <p className="text-2xl font-semibold">
                R{" "}
                {filteredSales
                  .reduce((sum, sale) => sum + sale.retailer_commission, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      {filteredSales.length > 0 ? (
        <div className="rounded-lg border border-border shadow-sm">
          <TablePlaceholder
            columns={["Date", "Type", "Value", "Commission", "Reference"]}
            data={tableData}
          />
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No transactions found</h3>
          <p className="mb-4 text-muted-foreground">
            {activeTab === "today"
              ? "You haven't made any sales today."
              : activeTab === "week"
              ? "No sales in the last 7 days."
              : activeTab === "month"
              ? "No sales in the last 30 days."
              : "Your transaction history is empty."}
          </p>
        </div>
      )}
    </div>
  );
}
