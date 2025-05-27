"use client";

import * as React from "react";
import { Activity, DollarSign, Store, Users } from "lucide-react";
import { CompactStatsTile } from "@/components/ui/compact-stats-tile";

interface StickyStatsHeaderProps {
  todaySalesTotal: number;
  todaysProfit: number;
  activeRetailers: number;
  agentsCount: number;
  todaySalesCount: number;
}

export function StickyStatsHeader({
  todaySalesTotal,
  todaysProfit,
  activeRetailers,
  agentsCount,
  todaySalesCount,
}: StickyStatsHeaderProps) {
  return (
    <div className="block md:hidden sticky top-16 z-10">
      {/* Blurred background layer */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm " />
      
      {/* Content layer - positioned above the blur */}
      <div className="relative z-10">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pt-3 pb-3 min-w-max">
            <CompactStatsTile
              label="Today's Sales"
              value={`R ${todaySalesTotal.toFixed(2)}`}
              icon={Activity}
              intent="primary"
            />
            <CompactStatsTile
              label="Today's Profit"
              value={`R ${todaysProfit.toFixed(2)}`}
              icon={DollarSign}
              intent="success"
            />
            <CompactStatsTile
              label="Active Retailers"
              value={activeRetailers}
              icon={Store}
              intent="info"
            />
            <CompactStatsTile
              label="Agents"
              value={agentsCount}
              icon={Users}
              intent="warning"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 