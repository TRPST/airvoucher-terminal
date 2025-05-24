import * as React from "react";
import { Wallet, CreditCard, Percent } from "lucide-react";
import { StatsTile } from "@/components/ui/stats-tile";
import { RetailerProfile } from "@/actions";

type RetailerStatsProps = {
  retailer: RetailerProfile;
};

export const RetailerStats: React.FC<RetailerStatsProps> = ({ retailer }) => {
  // Calculate available credit
  const availableCredit = retailer.credit_limit - retailer.credit_used;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatsTile
        label="Available Balance"
        value={`R ${retailer.balance.toFixed(2)}`}
        icon={Wallet}
        intent="success"
        subtitle="Current account balance"
      />
      <StatsTile
        label="Available Credit"
        value={`R ${availableCredit.toFixed(2)}`}
        icon={CreditCard}
        intent="warning"
        subtitle={`R ${retailer.credit_used.toFixed(2)} used of R ${retailer.credit_limit.toFixed(2)} limit`}
      />
      <StatsTile
        label="Commission Earned"
        value={`R ${retailer.commission_balance.toFixed(2)}`}
        icon={Percent}
        intent="info"
        subtitle="Total earned to date"
      />
    </div>
  );
};
