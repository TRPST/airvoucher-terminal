import * as React from 'react';
import { CreditCard, AlertCircle, Settings } from 'lucide-react';

type ConfirmSaleDialogProps = {
  voucherType: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  isOverride?: boolean;
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  onClearError?: () => void;
};

export const ConfirmSaleDialog: React.FC<ConfirmSaleDialogProps> = ({
  voucherType,
  amount,
  commissionRate,
  commissionAmount,
  isOverride = false,
  isLoading,
  error,
  onCancel,
  onConfirm,
  onClearError,
}) => {
  const handleConfirm = () => {
    if (error && onClearError) {
      onClearError();
    }
    onConfirm();
  };
  // Effect to prevent body scrolling when modal is open
  React.useEffect(() => {
    // Disable scrolling on body when modal is open
    document.body.style.overflow = 'hidden';

    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
              <span className="font-medium">{voucherType}</span>
            </div>
            <div className="flex justify-between border-t border-border py-2">
              <span className="text-sm text-muted-foreground">Value:</span>
              <span className="font-medium">R {amount.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Error</p>
              </div>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          )}

          <div className="mt-4 flex w-full justify-end space-x-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              {error ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : error ? 'Try Again' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
