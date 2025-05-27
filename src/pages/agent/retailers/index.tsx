import * as React from "react";
import { Search, Users, ArrowUpDown, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import useRequireRole from "@/hooks/useRequireRole";
import {
  fetchMyRetailers,
  type AgentRetailer,
  fetchAgentSummary,
} from "@/actions";

export default function AgentRetailers() {
  // Protect this route - only allow agent role
  const { isLoading: isLoadingAuth, user, isAuthorized } = useRequireRole("agent");
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<string>("name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [retailers, setRetailers] = React.useState<AgentRetailer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState({
    retailer_count: 0,
    active_count: 0,
    mtd_sales: 0,
  });

  // Fetch retailer data
  React.useEffect(() => {
    async function loadData() {
      try {
        // Get the actual user ID from auth instead of using "current"
        if (!user?.id) {
          console.error("No user ID available");
          return;
        }

        const agentId = user.id;

        const { data: retailersData, error: retailersError } =
          await fetchMyRetailers(agentId);

        if (retailersError) {
          throw new Error(
            `Failed to load retailers: ${retailersError.message}`
          );
        }

        setRetailers(retailersData || []);

        // Get summary data
        const { data: summaryData, error: summaryError } =
          await fetchAgentSummary(agentId);

        if (summaryError) {
          console.error("Error loading summary:", summaryError);
          // Continue without summary data
        } else if (summaryData) {
          setSummary({
            retailer_count: summaryData.retailer_count,
            active_count: retailers.filter((r) => r.status === "active").length,
            mtd_sales: summaryData.mtd_sales,
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load retailers"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!isLoadingAuth && isAuthorized && user?.id) {
      loadData();
    }
  }, [isLoadingAuth, isAuthorized, user?.id]);

  // Apply filters and sorting
  const filteredRetailers = React.useMemo(() => {
    return retailers
      .filter((retailer) => {
        const matchesSearch =
          retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (retailer.location || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || retailer.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (sortBy === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === "balance") {
          comparison = (a.balance || 0) - (b.balance || 0);
        } else if (sortBy === "commission") {
          comparison =
            (a.commission_balance || 0) - (b.commission_balance || 0);
        } else if (sortBy === "status") {
          comparison = a.status.localeCompare(b.status);
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
  }, [retailers, searchTerm, statusFilter, sortBy, sortOrder]);

  // Format data for table
  const tableData = filteredRetailers.map((retailer) => ({
    Retailer: (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          {retailer.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{retailer.name}</div>
          <div className="text-xs text-muted-foreground">
            {retailer.location || "No location"}
          </div>
        </div>
      </div>
    ),
    "Sales (MTD)": `R ${retailer.sales_count || 0}`,
    Commission: `R ${(retailer.commission_balance || 0).toFixed(2)}`,
    Status: (
      <div className="flex items-center">
        <div
          className={cn(
            "mr-2 h-2 w-2 rounded-full",
            retailer.status === "active"
              ? "bg-green-500"
              : retailer.status === "inactive"
              ? "bg-amber-500"
              : "bg-red-500"
          )}
        />
        <span className="text-xs capitalize">{retailer.status}</span>
      </div>
    ),
    Actions: (
      <a
        href={`/agent/retailers/${retailer.id}`}
        className="rounded-md px-2.5 py-1 text-xs text-primary hover:bg-primary/10"
      >
        View Details
      </a>
    ),
  }));

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Loading state
  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading retailers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 text-xl font-semibold text-destructive">
            Error
          </div>
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
          My Retailers
        </h1>
        <p className="text-muted-foreground">
          Manage and track the performance of retailers in your network.
        </p>
      </div>

      {/* Filters Section */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search retailers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <button
            onClick={() => handleSort("name")}
            className="flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span>{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-muted-foreground">Total Retailers</div>
          <div className="mt-1 text-2xl font-semibold">{retailers.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-muted-foreground">Active Retailers</div>
          <div className="mt-1 text-2xl font-semibold text-green-600">
            {retailers.filter((r) => r.status === "active").length}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-muted-foreground">MTD Sales</div>
          <div className="mt-1 text-2xl font-semibold">
            R {retailers.reduce((sum, r) => sum + (r.sales_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Retailers Table */}
      <TablePlaceholder
        columns={["Retailer", "Sales (MTD)", "Commission", "Status", "Actions"]}
        data={tableData}
        emptyMessage="No retailers found. Try adjusting your filters."
      />
    </div>
  );
}
