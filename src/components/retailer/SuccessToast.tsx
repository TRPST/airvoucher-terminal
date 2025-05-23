import * as React from "react";

type SuccessToastProps = {
  show: boolean;
  category: string | null;
  value: number | null;
};

export const SuccessToast: React.FC<SuccessToastProps> = ({
  show,
  category,
  value,
}) => {
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
        <div>
          <h4 className="font-medium">Sale Successful!</h4>
          <p className="text-sm">
            {category} voucher for R {value?.toFixed(2)} sold successfully.
          </p>
        </div>
      </div>
    </div>
  );
};
