import * as React from "react";
import { Printer, X, Receipt, Clock, Hash } from "lucide-react";

interface SaleReceiptDialogProps {
  receiptData: any;
  onClose: () => void;
  terminalName: string;
  retailerName: string;
}

export const SaleReceiptDialog: React.FC<SaleReceiptDialogProps> = ({
  receiptData,
  onClose,
  terminalName,
  retailerName,
}) => {  
  // Effect to prevent body scrolling when modal is open
  React.useEffect(() => {
    // Disable scrolling on body when modal is open
    document.body.style.overflow = "hidden";

    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Format amount with Rand symbol
  const formatAmount = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  // Format voucher code with spaces (xxxx xxxx xxxx xxxx)
  const formatVoucherCode = (code: string) => {
    if (!code) return "";
    return code.replace(/(.{4})(?=.)/g, "$1 ");
  };

  // Format date to local format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-ZA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Handle print button click
  const handlePrint = () => {
    // This will be implemented in the future
    console.log("Print functionality will be added in the future");
    window.print();
  };

  if (!receiptData) return null;

  const saleDate = receiptData.timestamp || new Date().toISOString();
  const voucherAmount = receiptData.amount || 0;
  const pin = receiptData.voucher_code || receiptData.pin || "";
  const serialNumber = receiptData.serial_number || "";
  const refNumber = receiptData.ref_number || `REF-${Date.now()}`;
  const instructions = receiptData.instructions || "Use the voucher code to recharge your account";
  const voucherType = receiptData.voucherType || receiptData.product_name || "Voucher";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card shadow-lg max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex flex-col items-center p-4 pb-2">
          <div className="mb-2 rounded-full bg-green-500/10 p-3 text-green-500">
            <Receipt className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Voucher Sale Completed</h2>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="w-full rounded-lg bg-muted p-4 mb-4">
            {/* Receipt content */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Retailer:</span>
                <span className="text-right">{retailerName}</span>
              </div>

              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium whitespace-nowrap">Terminal:</span>
                <span className="text-right">{terminalName}</span>
              </div>

              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Voucher:</span>
                <span className="text-right">{voucherType} {formatAmount(voucherAmount)}</span>
              </div>

              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Amount Paid:</span>
                <span className="text-right">{formatAmount(voucherAmount)}</span>
              </div>

              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Voucher Code:</span>
                </div>
                <div className="mt-1 flex items-center justify-center bg-background/50 p-2 rounded">
                  <code className="text-lg font-bold tracking-wider text-primary">
                    {formatVoucherCode(pin)}
                  </code>
                </div>
              </div>

              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Instructions:</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {instructions}
                </div>
              </div>

              <div className="flex justify-between border-t border-border pt-2 items-center">
                <span className="font-medium">Serial Number:</span>
                <code className="font-mono text-xs bg-background/50 p-1 rounded text-right">
                  {serialNumber}
                </code>
              </div>

              <div className="flex justify-between border-t border-border pt-2 items-center">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date & Time:</span>
                </div>
                <span className="text-right">{formatDate(saleDate)}</span>
              </div>

              <div className="flex justify-between border-t border-border pt-2 items-center">
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ref Number:</span>
                </div>
                <span className="text-sm text-right">{refNumber}</span>
              </div>
            </div>
          </div>

          <div className="w-full p-2 bg-primary/10 rounded-md text-sm text-primary mb-2">
            <p className="text-center">
              🛈 Please save this receipt. It will not be shown again after closing.
            </p>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 pt-2 border-t border-border mt-auto">
          <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-end pt-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
