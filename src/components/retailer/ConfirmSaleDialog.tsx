import * as React from "react";
import { CreditCard } from "lucide-react";

type ConfirmSaleDialogProps = {
  showDialog: boolean;
  selectedCategory: string | null;
  selectedValue: number | null;
  commissionRate: number | null;
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
  commissionRate,
  commissionError,
  onCancel,
  onConfirm,
  isSelling = false,
  saleError = null,
}) => {
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
            <div className="flex justify-between">
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
                <span className="text-sm font-medium mb-1">Commission Rate Error:</span>
                <span className="text-sm">{commissionError}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Commission Rate:
                  </span>
                  <span className="font-medium text-green-500">
                    {commissionRate !== null 
                      ? `${(commissionRate * 100).toFixed(1)}%` 
                      : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Your Commission:
                  </span>
                  <span className="font-medium text-green-500">
                    R {((selectedValue || 0) * (commissionRate || 0)).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {saleError && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
              <p className="text-sm font-medium">Error: {saleError}</p>
            </div>
          )}

          <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={commissionError !== null || isSelling}
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
