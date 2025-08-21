import * as React from "react";
import { motion } from "framer-motion";
import { CreditCard, ChevronLeft } from 'lucide-react';
import { VoucherType } from '@/actions';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

interface POSValuesGridProps {
  selectedCategory: string;
  isLoading: boolean;
  vouchers: VoucherType[];
  onValueSelect: (value: number) => void;
  onBackToCategories: () => void;
}

// OTT API Configuration
const OTT_CONFIG = {
  BASE_URL: '/api/ott/reseller/v1',
};

export function POSValuesGrid({
  selectedCategory,
  isLoading,
  vouchers,
  onValueSelect,
  onBackToCategories,
}: POSValuesGridProps) {
  const [ottAmounts] = React.useState([10, 20, 50, 100, 200, 1000, 2000]);
  const [isOttLoading, setIsOttLoading] = React.useState(false);

  // Issue OTT Voucher
  const issueOttVoucher = async (amount: number) => {
    setIsOttLoading(true);
    try {
      const uniqueReference = `ref-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      const params = {
        branch: 'DEFAULT_BRANCH',
        cashier: 'SYSTEM',
        mobileForSMS: '',
        till: 'WEB',
        uniqueReference,
        value: amount,
        vendorCode: '11',
      };

      // Convert params to URLSearchParams
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await axios.post(`${OTT_CONFIG.BASE_URL}/GetVoucher`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.success === 'true') {
        const voucherData = JSON.parse(response.data.voucher);
        onValueSelect(amount);
        toast.success('OTT voucher issued successfully');
      } else {
        throw new Error(response.data.message || 'Failed to issue voucher');
      }
    } catch (error) {
      console.error('Error issuing OTT voucher:', error);
      toast.error('Failed to issue OTT voucher');
    } finally {
      setIsOttLoading(false);
    }
  };

  // Common header component
  const Header = () => (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToCategories}
          className="flex items-center space-x-1 self-start"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="mt-5 whitespace-nowrap text-xl font-bold sm:hidden">
          {selectedCategory} Vouchers
        </h2>
      </div>
      <h2 className="hidden whitespace-nowrap text-xl font-bold sm:block">
        {selectedCategory} Vouchers
      </h2>
      <div className="hidden w-20 sm:block"></div>
    </div>
  );

  // Loading state component
  const LoadingState = () => (
    <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
      <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <h3 className="text-lg font-medium">Loading Vouchers</h3>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
      <CreditCard className="mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="text-lg font-medium">No Vouchers Available</h3>
      <p className="text-sm text-muted-foreground">
        There are no vouchers available for this category.
      </p>
    </div>
  );

  if (selectedCategory === 'OTT') {
    return (
      <div className="px-4 py-6">
        <Header />

        {/* OTT Amount Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {ottAmounts.map((amount) => (
            <motion.button
              key={amount}
              onClick={() => issueOttVoucher(amount)}
              disabled={isOttLoading}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/assets/vouchers/ott-logo.png"
                  alt="OTT"
                  className="h-12 w-12 rounded-lg object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <span className="text-lg font-semibold">R {amount}</span>
              </div>
              {isOttLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Regular voucher grid
  return (
    <div className="px-4 py-6">
      <Header />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {isLoading ? (
          <LoadingState />
        ) : vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <motion.button
              key={`${voucher.id}-${voucher.amount}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onValueSelect(voucher.amount)}
              className="flex h-32 flex-col items-center justify-center rounded-lg border border-border p-6 text-center shadow-sm hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-2 text-sm text-muted-foreground">{voucher.name}</div>
              <div className="text-2xl font-bold">R {voucher.amount.toFixed(0)}</div>
            </motion.button>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
