import * as React from "react";
import { cn } from "@/utils/cn";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  // Position the tooltip based on the side prop
  const getPosition = () => {
    switch (side) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 translate-y-2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2";
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm whitespace-nowrap",
            getPosition(),
            className
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 rotate-45",
              side === "top" && "top-full left-1/2 -translate-x-1/2 -translate-y-1",
              side === "right" && "right-full top-1/2 -translate-y-1/2 translate-x-1",
              side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 translate-y-1",
              side === "left" && "left-full top-1/2 -translate-y-1/2 -translate-x-1"
            )}
          />
        </div>
      )}
    </div>
  );
}
