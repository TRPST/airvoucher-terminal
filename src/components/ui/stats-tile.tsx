"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

// Variant definitions using CVA
const statsTileVariants = cva(
  "rounded-lg p-6 transition-all animate-fade-in flex flex-col space-y-3",
  {
    variants: {
      intent: {
        default: "bg-card text-card-foreground border border-border shadow-sm",
        primary: "bg-primary/10 text-primary border border-primary/20",
        success: "bg-green-500/10 text-green-500 border border-green-500/20",
        warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        info: "bg-primary/10 text-primary border border-primary/20",
        danger:
          "bg-destructive/10 text-destructive border border-destructive/20",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        true: "hover:scale-[1.02] hover:shadow-md cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      intent: "default",
      size: "md",
      hover: false,
    },
  }
);

// Export interface for component props
export interface StatsTileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsTileVariants> {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
}

export function StatsTile({
  className,
  intent,
  size,
  hover,
  label,
  value,
  icon: Icon,
  subtitle,
  ...props
}: StatsTileProps) {
  return (
    <div
      className={cn(statsTileVariants({ intent, size, hover, className }))}
      {...props}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium md:text-base">{label}</h3>
        {Icon && <Icon className="h-5 w-5 opacity-70" />}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold md:text-3xl">{value}</p>
        {subtitle && (
          <p className="text-xs opacity-70 md:text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
