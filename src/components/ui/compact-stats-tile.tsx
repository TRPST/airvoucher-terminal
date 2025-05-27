"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

// Compact variant definitions for mobile sticky header
const compactStatsTileVariants = cva(
  "rounded-lg p-2 transition-all flex items-center space-x-2 min-w-[120px] shrink-0",
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
      clickable: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      intent: "default",
      clickable: false,
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
  onTap?: () => void;
}

export function CompactStatsTile({
  className,
  intent,
  clickable,
  label,
  value,
  icon: Icon,
  onTap,
  ...props
}: CompactStatsTileProps) {
  return (
    <div
      className={cn(compactStatsTileVariants({ intent, clickable: !!onTap || clickable, className }))}
      onClick={onTap}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 opacity-70 shrink-0" />}
      <div className="flex flex-col min-w-0">
        <p className="text-base font-bold truncate">{value}</p>
        <p className="text-xs opacity-70 truncate">{label}</p>
      </div>
    </div>
  );
} 