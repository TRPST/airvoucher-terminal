import * as React from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useTerminal } from "@/contexts/TerminalContext";

interface TopNavBarProps {
  terminalName?: string;
  retailerName?: string;
  balance?: number;
  availableCredit?: number;
}

export function TopNavBar({
  terminalName: propTerminalName,
  retailerName: propRetailerName,
  balance: propBalance,
  availableCredit: propAvailableCredit,
}: TopNavBarProps) {
  const { theme, setTheme } = useTheme();
  const { 
    terminalName: contextTerminalName, 
    retailerName: contextRetailerName,
    balance: contextBalance,
    availableCredit: contextAvailableCredit,
    isBalanceLoading
  } = useTerminal();

  // Use props if provided, otherwise fall back to context values
  const terminalName = propTerminalName || contextTerminalName;
  const retailerName = propRetailerName || contextRetailerName;
  const balance = propBalance !== undefined ? propBalance : contextBalance;
  const availableCredit = propAvailableCredit !== undefined ? propAvailableCredit : contextAvailableCredit;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b bg-background border-border">
      {/* Left side - Terminal and Store Name */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">
          {terminalName} • {retailerName}
        </h1>
      </div>

      {/* Right side - Balances and actions */}
      <div className="flex items-center space-x-4">
        {/* Balance */}
        {isBalanceLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-24 h-8 bg-green-500/10 animate-pulse rounded-md"></div>
            <div className="w-24 h-8 bg-amber-500/10 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <>
            {/* Balance */}
            <div className="flex items-center px-3 py-1.5 bg-green-500/10 text-green-500 rounded-md border border-green-500/20">
              <span className="text-sm font-medium mr-1.5">BAL:</span>
              <span className="font-bold">R{Math.floor(balance)}</span>
            </div>

            {/* Credit */}
            <div className="flex items-center px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">
              <span className="text-sm font-medium mr-1.5">CREDIT:</span>
              <span className="font-bold">R{Math.floor(availableCredit)}</span>
            </div>
          </>
        )}

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Logout Button */}
        <Button variant="ghost" size="icon">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  );
} 