"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import { cn } from "@/utils/cn";

export function ThemeToggle({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        theme === "dark"
          ? "text-primary-foreground bg-primary/10 hover:bg-primary/20"
          : "text-primary bg-primary/10 hover:bg-primary/20",
        className
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      {...props}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
