import * as React from "react";
import { Wallet, CreditCard, Percent } from "lucide-react";
import { StatsTile } from "@/components/ui/stats-tile";
import { RetailerProfile } from "@/actions";

type RetailerStatsProps = {
  retailer: RetailerProfile;
};

export const RetailerStats: React.FC<RetailerStatsProps> = ({ retailer }) => {
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
        label="Credit Used"
        value={`R ${retailer.credit_used.toFixed(2)}`}
        icon={CreditCard}
        intent="warning"
        subtitle="Active credit amount"
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
