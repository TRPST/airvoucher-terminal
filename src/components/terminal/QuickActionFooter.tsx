import * as React from "react";
import { Plus, ShoppingCart, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionFooterProps {
  onEnterAmount: () => void;
  onSellVoucher: () => void;
  onViewRecentSales: () => void;
}

export function QuickActionFooter({
  onEnterAmount,
  onSellVoucher,
  onViewRecentSales,
}: QuickActionFooterProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-border bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onEnterAmount}
          className="flex-1 space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Enter Amount</span>
        </Button>

        <Button
          onClick={onSellVoucher}
          className="flex-1 space-x-2"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Sell Voucher</span>
        </Button>

        <Button
          variant="secondary"
          onClick={onViewRecentSales}
          className="flex-1 space-x-2"
        >
          <History className="h-4 w-4" />
          <span>Recent Sales</span>
        </Button>
      </div>
    </div>
  );
} 