import { useEffect, useState } from "react";
import { Activity, DollarSign, Store, Users, AlertCircle } from "lucide-react";

import { StatsTile } from "@/components/ui/stats-tile";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import useRequireRole from "@/hooks/useRequireRole";
import {
  fetchRetailers,
  fetchSalesReport,
  fetchEarningsSummary,
  type Retailer,
} from "@/actions/adminActions";

export default function AdminDashboard() {
  // State for dashboard data
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [todaySales, setTodaySales] = useState<any[]>([]);
  const [platformCommission, setPlatformCommission] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protect this route - only allow admin role
  const { isLoading: isAuthLoading } = useRequireRole("admin");

  // Fetch dashboard data
  useEffect(() => {
    async function loadDashboardData() {
      setIsDataLoading(true);
      try {
        console.log("Loading admin dashboard data...");

        // Get retailers
        const { data: retailersData, error: retailersError } =
          await fetchRetailers();
        if (retailersError) {
          throw new Error(
            `Error fetching retailers: ${retailersError.message}`
          );
        }

        // Get today's sales
        const today = new Date().toISOString().split("T")[0];
        const { data: salesData, error: salesError } = await fetchSalesReport({
          startDate: today,
          endDate: new Date().toISOString(),
        });
        if (salesError) {
          throw new Error(`Error fetching sales: ${salesError.message}`);
        }

        // Get earnings summary
        const { data: earningsData, error: earningsError } =
          await fetchEarningsSummary({
            startDate: today,
            endDate: new Date().toISOString(),
          });
        if (earningsError) {
          throw new Error(`Error fetching earnings: ${earningsError.message}`);
        }

        // Update state with fetched data
        setRetailers(retailersData || []);
        setTodaySales(salesData || []);

        // Calculate platform commission
        const commission =
          earningsData?.reduce(
            (sum, item) => sum + item.platform_commission,
            0
          ) || 0;
        setPlatformCommission(commission);

        console.log("Dashboard data loaded successfully");
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsDataLoading(false);
      }
    }

    if (!isAuthLoading) {
      loadDashboardData();
    }
  }, [isAuthLoading]);

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // Show loading state while fetching data
  if (isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-red-500">
        <AlertCircle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate dashboard metrics
  const todaySalesTotal = todaySales.reduce(
    (sum, sale) => sum + sale.amount,
    0
  );
  const activeRetailers = retailers.filter(
    (retailer) => retailer.status === "active"
  ).length;

  // We don't have agents data yet, let's estimate based on the retailers
  const agentsCount = new Set(
    retailers.map((r) => r.agent_profile_id).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to your Air Voucher admin dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsTile
          label="Today's Sales"
          value={`R ${todaySalesTotal.toFixed(2)}`}
          icon={Activity}
          intent="primary"
          subtitle={`${todaySales.length} transactions`}
        />
        <StatsTile
          label="Airvoucher Commission"
          value={`R ${platformCommission.toFixed(2)}`}
          icon={DollarSign}
          intent="success"
          subtitle="From today's sales"
        />
        <StatsTile
          label="Active Retailers"
          value={activeRetailers}
          icon={Store}
          intent="info"
          subtitle={`${retailers.length} total retailers`}
        />
        <StatsTile
          label="Agents"
          value={agentsCount}
          icon={Users}
          intent="warning"
          subtitle="Total agents assigned"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartPlaceholder
          title="Sales Over Time"
          description="Daily sales trend for the past 30 days"
        />
        <ChartPlaceholder
          title="Sales by Voucher Type"
          description="Distribution of sales by voucher category"
        />
      </div>
    </div>
  );
}
