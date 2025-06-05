"use client";

import * as React from "react";
import { Wallet, CreditCard, Percent } from "lucide-react";
import { CompactStatsTile } from "@/components/ui/compact-stats-tile";
import { RetailerProfile } from "@/actions";

interface StickyRetailerStatsHeaderProps {
  retailer: RetailerProfile;
}

export function StickyRetailerStatsHeader({
  retailer,
}: StickyRetailerStatsHeaderProps) {
  // Calculate available credit
  const availableCredit = retailer.credit_limit - retailer.credit_used;

  return (
    <div className="block md:hidden sticky top-16 z-10 bg-background/95 backdrop-blur-sm " style={{marginTop: 0}}>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pt-3 pb-3 min-w-max">
          <CompactStatsTile
            label="Avail. Balance"
            value={`R ${retailer.balance.toFixed(2)}`}
            icon={Wallet}
            intent="success"
          />
          <CompactStatsTile
            label="Avail. Credit"
            value={`R ${availableCredit.toFixed(2)}`}
            icon={CreditCard}
            intent="warning"
          />
          <CompactStatsTile
            label="Commission Earned"
            value={`R ${retailer.commission_balance.toFixed(2)}`}
            icon={Percent}
            intent="info"
          />
        </div>
      </div>
    </div>
  );
} 