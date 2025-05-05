import * as React from "react";
import { Activity, DollarSign, Store, Users } from "lucide-react";

import { StatsTile } from "@/components/ui/stats-tile";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import { getTodaySales, retailers, agents } from "@/lib/MockData";
import useRequireRole from "@/hooks/useRequireRole";

export default function AdminDashboard() {
  // Protect this route - only allow admin role
  const { isLoading } = useRequireRole("admin");

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  // Calculate dashboard metrics
  const todaySales = getTodaySales();
  const todaySalesTotal = todaySales.reduce(
    (sum, sale) => sum + sale.voucherValue,
    0
  );
  const platformCommission = todaySales.reduce(
    (sum, sale) => sum + sale.platformCommission,
    0
  );
  const activeRetailers = retailers.filter(
    (retailer) => retailer.status === "active"
  ).length;
  const activeAgents = agents.filter(
    (agent) => agent.status === "active"
  ).length;

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
          label="Active Agents"
          value={activeAgents}
          icon={Users}
          intent="warning"
          subtitle={`${agents.length} total agents`}
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
