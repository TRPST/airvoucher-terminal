import * as React from "react";
import { Wallet, CreditCard, Percent, TrendingUp } from "lucide-react";
import { CompactStatsTile } from "@/components/ui/compact-stats-tile";

interface StickyCashierHeaderProps {
  terminalName: string;
  retailerName: string;
  balance: number;
  creditLimit: number;
  creditUsed: number;
  commissionBalance: number;
}

export function StickyCashierHeader({
  terminalName,
  retailerName,
  balance,
  creditLimit,
  creditUsed,
  commissionBalance,
}: StickyCashierHeaderProps) {
  const availableCredit = creditLimit - creditUsed;
  const totalAvailable = balance + availableCredit;

  return (
    <div className="sticky top-0 z-30 bg-background border-b border-border">
      {/* Terminal Info */}
      <div className="px-4 py-3 border-b border-border">
        <h1 className="text-xl font-bold">{terminalName}</h1>
        <p className="text-sm text-muted-foreground">{retailerName} • Terminal POS</p>
      </div>

      {/* Balance Stats */}
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
    </div>
  );
}
