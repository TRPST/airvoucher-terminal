import * as React from "react";
import { useRouter } from "next/router";
import {
  Users,
  TrendingUp,
  Activity,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import useRequireRole from "@/hooks/useRequireRole";
import {
  fetchMyRetailers,
  fetchAgentStatements,
  type AgentRetailer,
  type AgentStatement,
} from "@/actions";

export default function RetailerDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  // Protect this route - only allow agent role
  const { isLoading: isLoadingAuth, user, isAuthorized } = useRequireRole("agent");

  const [retailer, setRetailer] = React.useState<AgentRetailer | null>(null);
  const [sales, setSales] = React.useState<AgentStatement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mtdSummary, setMtdSummary] = React.useState({
    mtdSales: 0,
    mtdCommission: 0,
    ytdSales: 0,
  });

  // Fetch retailer data
  React.useEffect(() => {
    async function loadRetailerData() {
      if (typeof id !== "string") return;

      try {
        setIsLoading(true);
        setError(null);

        // Get the actual user ID from auth instead of using "current"
        if (!user?.id) {
          console.error("No user ID available");
          return;
        }

        const agentId = user.id;

        // Fetch retailer info
        const { data: retailersData, error: retailersError } =
          await fetchMyRetailers(agentId);

        if (retailersError) {
          throw new Error(`Failed to load retailer: ${retailersError.message}`);
        }

        const foundRetailer = retailersData?.find((r) => r.id === id) || null;

        if (!foundRetailer) {
          throw new Error("Retailer not found");
        }

        setRetailer(foundRetailer);

        // Fetch sales/transactions for this retailer
        const { data: salesData, error: salesError } =
          await fetchAgentStatements(agentId, {});

        if (salesError) {
          console.error("Error loading sales:", salesError);
          // Continue with partial data
        } else {
          // Filter sales for this retailer
          const retailerSales =
            salesData?.filter(
              (sale) => sale.retailer_name === foundRetailer.name
            ) || [];
          setSales(retailerSales);

          // Calculate MTD/YTD figures
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const mtdSales = retailerSales.filter((sale) => {
            const saleDate = new Date(sale.created_at);
            return (
              saleDate.getMonth() === currentMonth &&
              saleDate.getFullYear() === currentYear
            );
          });

          const ytdSales = retailerSales.filter((sale) => {
            const saleDate = new Date(sale.created_at);
            return saleDate.getFullYear() === currentYear;
          });

          setMtdSummary({
            mtdSales: mtdSales.length,
            mtdCommission: mtdSales.reduce((sum, sale) => sum + sale.amount, 0),
            ytdSales: ytdSales.length,
          });
        }
      } catch (err) {
        console.error("Error in retailer details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load retailer data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!isLoadingAuth && isAuthorized && user?.id && id) {
      loadRetailerData();
    }
  }, [id, isLoadingAuth, isAuthorized, user?.id]);

  // Format sales data for the table
  const recentActivityData = sales.slice(0, 10).map((sale) => {
    const saleDate = new Date(sale.created_at);

    return {
      Date: saleDate.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      Time: saleDate.toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      Type: sale.type || "Transaction",
      Value: `R ${sale.amount.toFixed(2)}`,
      Notes: sale.notes || "-",
    };
  });

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Loading state
  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading retailer details...</p>
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
            onClick={() => router.push("/agent/retailers")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Back to Retailers
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!retailer) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Retailer Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The retailer you are looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/agent/retailers")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Back to Retailers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.push("/agent/retailers")}
          className="mb-4 flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Retailers
        </button>

        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Retailer Detail
        </h1>
        <p className="text-muted-foreground">
          Detailed information and performance metrics for {retailer.name}.
        </p>
      </div>

      {/* Retailer Profile */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-1"
        >
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
              {retailer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{retailer.name}</h2>
              <div
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  retailer.status === "active"
                    ? "bg-green-500/10 text-green-500"
                    : retailer.status === "inactive"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-red-500/10 text-red-500"
                )}
              >
                {retailer.status.charAt(0).toUpperCase() +
                  retailer.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{retailer.location || "No contact info"}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{retailer.location || "No phone"}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>Balance: R {retailer.balance.toFixed(2)}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>
                Commission Balance: R {retailer.commission_balance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Award className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span>{retailer.sales_count || 0} Sales this month</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsTile
              icon={Activity}
              label="MTD Sales"
              value={mtdSummary.mtdSales.toString()}
              subtitle="This month"
              intent="success"
            />
            <StatsTile
              icon={TrendingUp}
              label="MTD Commission"
              value={`R ${mtdSummary.mtdCommission.toFixed(2)}`}
              subtitle="This month"
              intent="primary"
            />
            <StatsTile
              icon={Users}
              label="YTD Sales"
              value={mtdSummary.ytdSales.toString()}
              subtitle="This year"
              intent="info"
            />
          </div>

          {/* Sales Chart */}
          <div className="overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium">Sales Performance</h3>
            <div className="h-[240px]">
              <ChartPlaceholder
                title="Sales Performance"
                description="Monthly sales data visualization"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            Latest transactions and events for this retailer.
          </p>
        </div>
        <TablePlaceholder
          columns={["Date", "Time", "Type", "Value", "Notes"]}
          data={recentActivityData}
          emptyMessage="No activity found for this retailer"
        />
      </motion.div>
    </div>
  );
}
