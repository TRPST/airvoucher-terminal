import * as React from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { agents, sales, type Sale } from "@/lib/MockData";
import { cn } from "@/utils/cn";

export default function AgentCommissions() {
  const [filter, setFilter] = React.useState<"pending" | "paid">("pending");
  const [dateRange, setDateRange] = React.useState<
    "all" | "mtd" | "past30" | "past90"
  >("mtd");

  // Get the first active agent for demo purposes
  const agent = agents.find((a) => a.status === "active") || agents[0];

  // Filter sales based on retailer association with this agent
  const agentSales = React.useMemo(() => {
    // In a real app, would use an API endpoint to get this data
    return sales.filter((sale) => {
      const retailer = sale.retailerId;
      // Return only sales for this agent's retailers
      return (
        retailer.startsWith("r") &&
        (retailer === "r1" || retailer === "r3" || retailer === "r6")
      );
    });
  }, []);

  // Apply date range filter
  const filteredSales = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return agentSales.filter((sale) => {
      const saleDate = new Date(sale.date);

      if (dateRange === "mtd") {
        // Month to date
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      } else if (dateRange === "past30") {
        // Past 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return saleDate >= thirtyDaysAgo;
      } else if (dateRange === "past90") {
        // Past 90 days
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return saleDate >= ninetyDaysAgo;
      }

      // All time
      return true;
    });
  }, [agentSales, dateRange]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const total = filteredSales.reduce(
      (sum, sale) => sum + sale.agentCommission,
      0
    );
    const pendingAmount = total * 0.4; // For demo, 40% still pending
    const paidAmount = total - pendingAmount;
    const transactionCount = filteredSales.length;

    return {
      total,
      pending: pendingAmount,
      paid: paidAmount,
      count: transactionCount,
    };
  }, [filteredSales]);

  // Prepare table data
  const tableData = React.useMemo(() => {
    // Separate into paid/pending for demo purposes
    const pendingSales = filteredSales.slice(
      0,
      Math.floor(filteredSales.length * 0.4)
    );
    const paidSales = filteredSales.slice(
      Math.floor(filteredSales.length * 0.4)
    );

    // Show either pending or paid based on filter
    const displaySales = filter === "pending" ? pendingSales : paidSales;

    return displaySales.map((sale) => {
      // Format date
      const saleDate = new Date(sale.date);
      const formattedDate = saleDate.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        Date: formattedDate,
        Retailer:
          sale.retailerId === "r1"
            ? "Soweto Corner Shop"
            : sale.retailerId === "r3"
            ? "Sandton Convenience"
            : sale.retailerId === "r6"
            ? "Pretoria Central Kiosk"
            : "Unknown Retailer",
        Type: sale.voucherType,
        Value: `R ${sale.voucherValue.toFixed(2)}`,
        Commission: `R ${sale.agentCommission.toFixed(2)}`,
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
  }, [filteredSales, filter]);

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
          value={`R ${summaryStats.total.toFixed(2)}`}
          icon={TrendingUp}
          intent="info"
          subtitle={`${summaryStats.count} transactions`}
        />
        <StatsTile
          label="Paid Commission"
          value={`R ${summaryStats.paid.toFixed(2)}`}
          icon={DollarSign}
          intent="success"
          subtitle="Already paid out"
        />
        <StatsTile
          label="Pending Commission"
          value={`R ${summaryStats.pending.toFixed(2)}`}
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="mtd">This Month</option>
              <option value="past30">Past 30 Days</option>
              <option value="past90">Past 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Commission Table */}
      <TablePlaceholder
        columns={["Date", "Retailer", "Type", "Value", "Commission", "Status"]}
        data={tableData}
        emptyMessage={`No ${filter} commissions found.`}
        size="lg"
        className="animate-fade-in"
      />

      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Commission Payout Schedule
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <div className="text-sm font-medium">Next Payout Date</div>
            <div className="text-2xl font-semibold text-primary">
              15 May 2025
            </div>
            <div className="text-sm text-muted-foreground">
              Pending commission will be processed and paid on this date.
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col gap-1.5">
            <div className="text-sm font-medium">Payment Method</div>
            <div className="text-base">Direct Bank Transfer</div>
            <div className="text-sm text-muted-foreground">
              Funds will be transferred to your registered bank account.
            </div>
          </div>

          <div className="border-t border-border pt-4 flex flex-col gap-1.5">
            <div className="text-sm font-medium">Payment Information</div>
            <div className="text-base">First National Bank ●●●● 4567</div>
            <div className="text-sm text-muted-foreground">
              <button className="text-primary hover:underline">
                Update payment details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
