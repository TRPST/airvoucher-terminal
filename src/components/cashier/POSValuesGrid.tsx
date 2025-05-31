import * as React from "react";
import { motion } from "framer-motion";
import { CreditCard, ChevronLeft } from "lucide-react";
import { VoucherType } from "@/actions";
import { Button } from "@/components/ui/button";

interface POSValuesGridProps {
  selectedCategory: string;
  isLoading: boolean;
  vouchers: VoucherType[];
  onValueSelect: (value: number) => void;
  onBackToCategories: () => void;
}

export function POSValuesGrid({
  selectedCategory,
  isLoading,
  vouchers,
  onValueSelect,
  onBackToCategories,
}: POSValuesGridProps) {
  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToCategories}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-bold">
          {selectedCategory} Vouchers
        </h2>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <h3 className="text-lg font-medium">Loading Vouchers</h3>
          </div>
        ) : vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <motion.button
              key={`${voucher.id}-${voucher.amount}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onValueSelect(voucher.amount)}
              className="flex flex-col items-center justify-center h-32 rounded-lg border border-border p-6 text-center shadow-sm hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-2 text-sm text-muted-foreground">
                {voucher.name}
              </div>
              <div className="text-2xl font-bold">
                R {voucher.amount.toFixed(0)}
              </div>
            </motion.button>
          ))
        ) : (
          <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
            <CreditCard className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Vouchers Available</h3>
            <p className="text-sm text-muted-foreground">
              There are no {selectedCategory} vouchers available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 