"use client";

import * as React from "react";
import { CompactStatsTile, CompactStatsTileProps } from "./compact-stats-tile";
import { cn } from "@/utils/cn";

export interface StickyStatsHeaderProps {
  stats: CompactStatsTileProps[];
  visible: boolean;
  onStatClick?: (index: number) => void;
}

export function StickyStatsHeader({ stats, visible, onStatClick }: StickyStatsHeaderProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div
      className={cn(
        "sticky top-[73px] z-10 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300 md:hidden",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}
    >
      <div className="px-4 py-2">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {stats.map((stat, index) => (
            <CompactStatsTile
              key={`${stat.label}-${index}`}
              {...stat}
              clickable={true}
              onTap={() => onStatClick?.(index)}
              className="snap-center"
            />
          ))}
        </div>
      </div>
    </div>
  );
} 