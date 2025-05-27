import * as React from "react";
import {
  Users,
  TrendingUp,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { StickyAgentStatsHeader } from "@/components/agent/StickyAgentStatsHeader";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/utils/cn";
import useRequireRole from "@/hooks/useRequireRole";
import {
  fetchMyRetailers,
  fetchAgentSummary,
  type AgentRetailer,
} from "@/actions";

export default function AgentDashboard() {
  // Protect this route - only allow agent role
  const { isLoading: isLoadingAuth, user, isAuthorized } = useRequireRole("agent");
  const [retailers, setRetailers] = React.useState<AgentRetailer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState({
    retailer_count: 0,
    mtd_sales: 0,
    mtd_commission: 0,
    ytd_commission: 0,
  });

  // Fetch agent data
  React.useEffect(() => {
    async function loadData() {
      try {
        // Get the actual user ID from auth instead of using "current"
        if (!user?.id) {
          console.error("No user ID available");
          return;
        }

        const agentId = user.id;

        // Fetch retailers
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
          setSummary(summaryData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load agent data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (!isLoadingAuth && isAuthorized && user?.id) {
      loadData();
    }
  }, [isLoadingAuth, isAuthorized, user?.id]);

  // Show loading state while checking authentication
  if (isLoadingAuth || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading dashboard...</p>
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

  // Top performing retailers (sort by commission balance)
  const topRetailers = [...retailers]
    .sort((a, b) => (b.commission_balance || 0) - (a.commission_balance || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Agent Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back. Here's an overview of your portfolio.
        </p>
      </div>

      {/* Mobile Sticky Stats Header */}
      <StickyAgentStatsHeader
        retailerCount={summary.retailer_count}
        mtdCommission={summary.mtd_commission}
        ytdCommission={summary.ytd_commission}
        mtdSales={summary.mtd_sales}
      />

      {/* Desktop Stats Overview */}
      <div className="hidden md:grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="My Retailers"
          value={summary.retailer_count.toString()}
          icon={Users}
          intent="info"
          subtitle="Active accounts"
        />
        <StatsTile
          label="Commission (MTD)"
          value={`R ${summary.mtd_commission.toFixed(2)}`}
          icon={TrendingUp}
          intent="success"
          subtitle={`${summary.mtd_sales} transactions`}
        />
        <StatsTile
          label="YTD Commission"
          value={`R ${summary.ytd_commission.toFixed(2)}`}
          icon={Activity}
          intent="warning"
          subtitle="Year to date earnings"
        />
      </div>

      {/* Commission Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ChartPlaceholder
          title="Commission Over Time"
          description="Monthly commission earnings breakdown"
          height="lg"
        />
      </motion.div>

      {/* Top Retailers Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top Performing Retailers</h2>
          <a
            href="/agent/retailers"
            className="flex items-center text-sm text-primary hover:underline"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>

        {topRetailers.length > 0 ? (
          <Carousel>
            <CarouselContent gap={16}>
              {topRetailers.map((retailer) => (
                <CarouselItem key={retailer.id} width="300px">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {retailer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium line-clamp-1">
                          {retailer.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {retailer.location || "No location"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between border-t border-border pt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-semibold">
                          R {retailer.balance.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Commission</p>
                        <p className="font-semibold">
                          R {(retailer.commission_balance || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
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
                        <span className="text-xs capitalize">
                          {retailer.status}
                        </span>
                      </div>
                      <a
                        href={`/agent/retailers/${retailer.id}`}
                        className="rounded-md px-2.5 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        View Details
                      </a>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              No retailers found. Add some retailers to get started.
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity Section - Simplified without mock data */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>

        <div className="space-y-4">
          {retailers.length > 0 ? (
            <>
              <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Retailers Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    You have {retailers.length} retailers in your network
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Monthly Sales Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {summary.mtd_sales} transactions this month
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No recent activity to display
            </div>
          )}

          <div className="flex justify-center pt-2">
            <a
              href="/agent/commissions"
              className="flex items-center text-sm text-primary hover:underline"
            >
              View Commission Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
