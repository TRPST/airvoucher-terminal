"use client";

import * as React from "react";
import { Users, TrendingUp, Activity } from "lucide-react";
import { CompactStatsTile } from "@/components/ui/compact-stats-tile";

interface StickyAgentStatsHeaderProps {
  retailerCount: number;
  mtdCommission: number;
  ytdCommission: number;
  mtdSales: number;
}

export function StickyAgentStatsHeader({
  retailerCount,
  mtdCommission,
  ytdCommission,
  mtdSales,
}: StickyAgentStatsHeaderProps) {
  return (
    <div className="block md:hidden sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pt-3 pb-3 min-w-max">
          <CompactStatsTile
            label="My Retailers"
            value={retailerCount.toString()}
            icon={Users}
            intent="info"
          />
          <CompactStatsTile
            label="Commission (MTD)"
            value={`R ${mtdCommission.toFixed(2)}`}
            icon={TrendingUp}
            intent="success"
          />
          <CompactStatsTile
            label="YTD Commission"
            value={`R ${ytdCommission.toFixed(2)}`}
            icon={Activity}
            intent="warning"
          />
        </div>
      </div>
    </div>
  );
} 