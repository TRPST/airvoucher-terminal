import * as React from "react";
import { motion } from "framer-motion";
import { CreditCard, ChevronLeft, DollarSign } from 'lucide-react';
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
  const [ottAmounts] = React.useState([2, 5, 10, 20, 50, 100, 200, 1000, 2000]);

  // Custom amount state for OTT
  const [customAmount, setCustomAmount] = React.useState('');
  const [customAmountError, setCustomAmountError] = React.useState('');

  // Issue OTT Voucher
  const issueOttVoucher = async (amount: number) => {
    // Don't make API call here - just select the value
    // The actual OTT API call will happen in the sale confirmation flow
    onValueSelect(amount);
  };

  // Handle custom amount input change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setCustomAmountError('');
  };

  // Validate and process custom amount
  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);

    if (!customAmount || isNaN(amount)) {
      setCustomAmountError('Please enter a valid amount');
      return;
    }

    if (amount < 1) {
      setCustomAmountError('Minimum amount is R1');
      return;
    }

    if (amount > 10000) {
      setCustomAmountError('Maximum amount is R10,000');
      return;
    }

    if (amount !== Math.floor(amount)) {
      setCustomAmountError('Amount must be a whole number');
      return;
    }

    // Clear the input and process the sale
    setCustomAmount('');
    setCustomAmountError('');
    issueOttVoucher(amount);
  };

  // Handle Enter key press in custom amount input
  const handleCustomAmountKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomAmountSubmit();
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
            </motion.button>
          ))}

          {/* Custom Amount Card */}
          <motion.div
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:border-primary hover:shadow-md"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div className="w-full space-y-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  onKeyPress={handleCustomAmountKeyPress}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-center text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  min="1"
                  max="10000"
                />
                <Button
                  onClick={handleCustomAmountSubmit}
                  className="h-8 w-full px-3 text-xs"
                  disabled={!customAmount}
                >
                  Custom
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Custom Amount Error Display */}
        {customAmountError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {customAmountError}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">OTT Sales Information</h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Select a predefined amount or enter a custom amount</li>
            <li>• Custom amounts: R1 - R10,000 (not all amounts may be available)</li>
            <li>• You'll be notified if an amount is not supported</li>
          </ul>
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
