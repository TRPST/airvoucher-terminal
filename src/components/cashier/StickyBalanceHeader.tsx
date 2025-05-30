import * as React from "react";
import { Wallet, CreditCard, Percent, TrendingUp } from "lucide-react";
import { CompactStatsTile } from "@/components/ui/compact-stats-tile";

interface StickyBalanceHeaderProps {
  balance: number;
  creditLimit: number;
  creditUsed: number;
  commissionBalance: number;
}

export function StickyBalanceHeader({
  balance,
  creditLimit,
  creditUsed,
  commissionBalance,
}: StickyBalanceHeaderProps) {
  const availableCredit = creditLimit - creditUsed;
  const totalAvailable = balance + availableCredit;

  return (
    <div className="sticky top-16 z-10 bg-background">
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
        {/* <CompactStatsTile
          label="Total"
          value={`R ${totalAvailable.toFixed(2)}`}
          icon={TrendingUp}
        /> */}
      </div>
    </div>
  );
}
