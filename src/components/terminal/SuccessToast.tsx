import * as React from "react";

type SuccessToastProps = {
  show: boolean;
  voucherType: string;
  amount: number;
  pin: string;
  onClose: () => void;
  onViewReceipt: () => void;
};

export const SuccessToast: React.FC<SuccessToastProps> = ({
  show,
  voucherType,
  amount,
  pin,
  onClose,
  onViewReceipt,
}) => {
  // Auto-close the toast after 5 seconds
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in-20 max-w-md rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-500 shadow-lg">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-5 w-5"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div className="flex-1">
          <h4 className="font-medium">Sale Successful!</h4>
          <p className="text-sm">
            {voucherType} voucher for R {amount.toFixed(2)} sold successfully.
          </p>
        </div>
        <button 
          onClick={onViewReceipt}
          className="ml-2 px-3 py-1 text-xs rounded-md border border-green-500/30 hover:bg-green-500/20"
        >
          View Receipt
        </button>
      </div>
    </div>
  );
};
