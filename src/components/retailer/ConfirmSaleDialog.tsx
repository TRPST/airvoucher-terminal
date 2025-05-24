import * as React from "react";
import { CreditCard, Wallet, AlertCircle } from "lucide-react";
import { RetailerProfile } from "@/actions";

type ConfirmSaleDialogProps = {
  showDialog: boolean;
  selectedCategory: string | null;
  selectedValue: number | null;
  retailer: RetailerProfile | null;
  commissionData: {
    rate: number;
    amount: number;
    groupName: string;
  } | null;
  commissionError: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  isSelling?: boolean;
  saleError?: string | null;
};

export const ConfirmSaleDialog: React.FC<ConfirmSaleDialogProps> = ({
  showDialog,
  selectedCategory,
  selectedValue,
  retailer,
  commissionData,
  commissionError,
  onCancel,
  onConfirm,
  isSelling = false,
  saleError = null,
}) => {
  // Calculate available funds
  const availableCredit = React.useMemo(() => {
    if (!retailer) return 0;
    return retailer.credit_limit - retailer.credit_used;
  }, [retailer]);

  const totalAvailableFunds = React.useMemo(() => {
    if (!retailer) return 0;
    return retailer.balance + availableCredit;
  }, [retailer, availableCredit]);

  const willUseCredit = React.useMemo(() => {
    if (!retailer || !selectedValue) return false;
    return retailer.balance < selectedValue;
  }, [retailer, selectedValue]);

  const amountFromBalance = React.useMemo(() => {
    if (!retailer || !selectedValue) return 0;
    return Math.min(retailer.balance, selectedValue);
  }, [retailer, selectedValue]);

  const amountFromCredit = React.useMemo(() => {
    if (!retailer || !selectedValue) return 0;
    return willUseCredit ? selectedValue - amountFromBalance : 0;
  }, [retailer, selectedValue, willUseCredit, amountFromBalance]);

  const hasInsufficientFunds = React.useMemo(() => {
    if (!selectedValue) return false;
    return totalAvailableFunds < selectedValue;
  }, [totalAvailableFunds, selectedValue]);

  // Effect to prevent body scrolling when modal is open
  React.useEffect(() => {
    if (showDialog) {
      // Disable scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDialog]);

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <h2 className="mb-1 text-xl font-semibold">Confirm Sale</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            You're about to sell the following voucher:
          </p>

          <div className="mb-6 w-full rounded-lg bg-muted p-4">
            <div className="flex justify-between pb-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <span className="font-medium">{selectedCategory}</span>
            </div>
            <div className="flex justify-between border-t border-border py-2">
              <span className="text-sm text-muted-foreground">Value:</span>
              <span className="font-medium">
                R {selectedValue?.toFixed(2)}
              </span>
            </div>
            {commissionError ? (
              <div className="flex flex-col border-t border-border py-2 text-red-500">
                <span className="text-sm font-medium mb-1">Commission Error:</span>
                <span className="text-sm">{commissionError}</span>
              </div>
            ) : (
              <>
                {commissionData && (
                  <div className="flex justify-between border-t border-border py-2">
                    <span className="text-sm text-muted-foreground">
                      Commission Group:
                    </span>
                    <span className="font-medium text-blue-500">
                      {commissionData.groupName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Your Commission:
                  </span>
                  <span className="font-medium text-green-500">
                    {commissionData !== null 
                      ? `R ${commissionData.amount.toFixed(2)}`
                      : 'Loading...'}
                  </span>
                </div>
              </>
            )}
          </div>          

          {/* Insufficient Funds Warning */}
          {hasInsufficientFunds && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Insufficient Funds</p>
              </div>
              <p className="text-xs mt-1">
                You need R {selectedValue?.toFixed(2)} but only have R {totalAvailableFunds.toFixed(2)} available.
              </p>
            </div>
          )}

          {saleError && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
              <p className="text-sm font-medium">Error: {saleError}</p>
            </div>
          )}

          <div className="flex w-full justify-end space-x-2 mt-4">
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={commissionError !== null || isSelling || hasInsufficientFunds}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSelling ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
