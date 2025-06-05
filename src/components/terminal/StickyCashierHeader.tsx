import * as React from "react";
import { Wallet, CreditCard, Percent, TrendingUp } from "lucide-react";
import { CompactStatsTile } from "@/components/ui/compact-stats-tile";
import { useTerminal } from "@/contexts/TerminalContext";

interface StickyCashierHeaderProps {
  terminalName?: string;
  retailerName?: string;
  balance?: number;
  creditLimit?: number;
  creditUsed?: number;
  commissionBalance?: number;
}

export function StickyCashierHeader({
  terminalName: propTerminalName,
  retailerName: propRetailerName,
  balance: propBalance,
  creditLimit: propCreditLimit,
  creditUsed: propCreditUsed,
  commissionBalance: propCommissionBalance,
}: StickyCashierHeaderProps) {
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
  
  // For credit calculations, try to use props first
  const creditLimit = propCreditLimit || 0;
  const creditUsed = propCreditUsed || 0;
  const availableCredit = propCreditLimit !== undefined ? (creditLimit - creditUsed) : contextAvailableCredit;
  const commissionBalance = propCommissionBalance || 0;
  const totalAvailable = balance + availableCredit;

  return (
    <div className="sticky top-0 z-30 bg-background border-b border-border">
      {/* Terminal Info */}
      <div className="px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold">{terminalName}</h1>
        <p className="text-sm text-muted-foreground">{retailerName} • Terminal POS</p>
      </div>

      {/* Balance Stats */}
      {isBalanceLoading ? (
        <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4 md:gap-3 md:p-3">
          <div className="h-20 bg-success/5 animate-pulse rounded-md"></div>
          <div className="h-20 bg-warning/5 animate-pulse rounded-md"></div>
          <div className="h-20 bg-info/5 animate-pulse rounded-md"></div>
          <div className="h-20 bg-muted animate-pulse rounded-md"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4 md:gap-3 md:p-3">
          <CompactStatsTile
            label="Balance"
            value={`R ${balance.toFixed(2)}`}
            icon={Wallet}
            intent="success"
          />
          <CompactStatsTile
            label="Credit"
            value={`R ${availableCredit.toFixed(2)}`}
            icon={CreditCard}
            intent="warning"
          />
          <CompactStatsTile
            label="Commission"
            value={`R ${commissionBalance.toFixed(2)}`}
            icon={Percent}
            intent="info"
          />
          <CompactStatsTile
            label="Total"
            value={`R ${totalAvailable.toFixed(2)}`}
            icon={TrendingUp}
          />
        </div>
      )}
    </div>
  );
}
