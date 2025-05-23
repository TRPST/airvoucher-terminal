import * as React from "react";
import { motion } from "framer-motion";
import { CreditCard, ChevronLeft } from "lucide-react";
import { VoucherType } from "@/actions";

type VoucherValuesGridProps = {
  selectedCategory: string;
  isLoading: boolean;
  vouchers: VoucherType[];
  onValueSelect: (value: number) => void;
  onBackToCategories: () => void;
};

export const VoucherValuesGrid: React.FC<VoucherValuesGridProps> = ({
  selectedCategory,
  isLoading,
  vouchers,
  onValueSelect,
  onBackToCategories,
}) => {
  return (
    <div>
      <div className="mb-4 space-y-3">
        <button
          onClick={onBackToCategories}
          className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors group"
        >
          <ChevronLeft className="mr-2 h-5 w-5 transition-transform duration-200 transform group-hover:-translate-x-1" />
          Back to Categories
        </button>
        <h2 className="text-lg font-medium">
          Select {selectedCategory} Voucher Value
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <h3 className="text-lg font-medium">Loading Vouchers</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch available {selectedCategory} vouchers.
            </p>
          </div>
        ) : vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <motion.button
              key={`${voucher.id}-${voucher.amount}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onValueSelect(voucher.amount)}
              className="flex flex-col items-center justify-center rounded-lg border border-border p-6 text-center shadow-sm hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-2 text-sm text-muted-foreground">
                {voucher.name}
              </div>
              <div className="text-2xl font-bold">
                R {voucher.amount.toFixed(2)}
              </div>
            </motion.button>
          ))
        ) : (
          <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
            <CreditCard className="mb-2 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Vouchers Available</h3>
            <p className="text-sm text-muted-foreground">
              There are no {selectedCategory} vouchers available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
