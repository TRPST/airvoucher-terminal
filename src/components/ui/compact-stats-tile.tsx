"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

// Variant definitions using CVA for compact tiles
const compactStatsTileVariants = cva(
  "rounded-lg transition-all flex flex-col items-start justify-between min-w-[140px] flex-shrink-0",
  {
    variants: {
      intent: {
        default: "bg-card text-card-foreground border border-border shadow-sm",
        primary: "bg-primary/10 text-primary border border-primary/20",
        success: "bg-green-500/10 text-green-500 border border-green-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        info: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
        danger: "bg-destructive/10 text-destructive border border-destructive/20",
      },
    },
    defaultVariants: {
      intent: "default",
    },
  }
);

// Export interface for component props
export interface CompactStatsTileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof compactStatsTileVariants> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

export function CompactStatsTile({
  className,
  intent,
  label,
  value,
  icon: Icon,
  ...props
}: CompactStatsTileProps) {
  return (
    <div
      className={cn(compactStatsTileVariants({ intent, className }), "p-4 h-20")}
      {...props}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <h3 className="text-sm font-medium text-muted-foreground truncate flex-1">{label}</h3>
        {Icon && <Icon className="h-4 w-4 opacity-70 ml-2 flex-shrink-0" />}
      </div>
      <div className="w-full">
        <p className="text-base font-bold truncate">{value}</p>
      </div>
    </div>
  );
} 