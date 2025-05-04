import * as React from "react";
import { Users, TrendingUp, Activity, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { agents, retailers, getAgentCommissionSummary } from "@/lib/MockData";
import { cn } from "@/utils/cn";

export default function AgentDashboard() {
  // Get the first active agent for demo purposes
  const agent = agents.find((a) => a.status === "active") || agents[0];

  // Get agent retailers
  const agentRetailers = retailers.filter((r) => r.agentId === agent.id);

  // Get commission summary for this agent
  const commissionSummary = getAgentCommissionSummary(agent.id);

  // Top performing retailers (sort by available balance in this demo)
  const topRetailers = [...agentRetailers]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Agent Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {agent.name}. Here's an overview of your portfolio.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="My Retailers"
          value={agent.retailers.toString()}
          icon={Users}
          intent="info"
          subtitle="Active accounts"
        />
        <StatsTile
          label="Commission (MTD)"
          value={`R ${commissionSummary.mtdCommission.toFixed(2)}`}
          icon={TrendingUp}
          intent="success"
          subtitle={`${commissionSummary.mtdSalesCount} transactions`}
        />
        <StatsTile
          label="Previous Month"
          value={`R ${commissionSummary.prevMonthCommission.toFixed(2)}`}
          icon={Activity}
          intent="warning"
          subtitle={`${commissionSummary.prevMonthSalesCount} transactions`}
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
                          {retailer.contact}
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
                          R {retailer.commission.toFixed(2)}
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

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">New Commission Earned</h3>
              <p className="text-sm text-muted-foreground">
                R 45.50 from Soweto Corner Shop
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Today, 10:24 AM
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">New Retailer Onboarded</h3>
              <p className="text-sm text-muted-foreground">
                Alex Mini Mart joined your network
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Yesterday, 2:15 PM
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Commission Payout</h3>
              <p className="text-sm text-muted-foreground">
                R 350.00 transferred to your account
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              May 1, 2025
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button className="inline-flex items-center text-sm text-primary hover:underline">
            View All Activity
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
