"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { BarChart } from "lucide-react";

import { cn } from "@/utils/cn";

// Variant definitions using CVA
const chartPlaceholderVariants = cva(
  "rounded-lg border border-border bg-card p-6 shadow-sm transition-all animate-fade-in",
  {
    variants: {
      height: {
        sm: "h-[150px]",
        md: "h-[250px]",
        lg: "h-[350px]",
      },
    },
    defaultVariants: {
      height: "md",
    },
  }
);

export interface ChartPlaceholderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartPlaceholderVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function ChartPlaceholder({
  className,
  height,
  title,
  description = "Chart goes here",
  icon,
  ...props
}: ChartPlaceholderProps) {
  return (
    <div
      className={cn(chartPlaceholderVariants({ height, className }))}
      {...props}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
      </div>

      <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
        {icon || <BarChart className="mb-3 h-12 w-12 opacity-20" />}
        <p className="max-w-[160px] text-center text-sm opacity-70">
          {description}
        </p>
      </div>
    </div>
  );
}
