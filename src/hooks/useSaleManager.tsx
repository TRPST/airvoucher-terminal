import * as React from 'react';
import { sellVoucher, type VoucherType } from '@/actions';
import { useTerminal } from '@/contexts/TerminalContext';
import type { CashierTerminalProfile } from '@/actions';

type SaleInfo = {
  pin: string;
  serial_number?: string;
};

type ReceiptData = {
  voucherType: string;
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  [key: string]: any;
};

type CommissionData = {
  rate: number;
  amount: number;
  groupName: string;
};

export function useSaleManager(
  terminal: CashierTerminalProfile | null,
  setTerminal: React.Dispatch<React.SetStateAction<CashierTerminalProfile | null>>
) {
  // Sale UI state
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [saleComplete, setSaleComplete] = React.useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = React.useState(false);

  // Sale process state
  const [isSelling, setIsSelling] = React.useState(false);
  const [saleError, setSaleError] = React.useState<string | null>(null);
  const [saleInfo, setSaleInfo] = React.useState<SaleInfo | null>(null);
  const [receiptData, setReceiptData] = React.useState<ReceiptData | null>(null);

  const { updateBalanceAfterSale } = useTerminal();

  // Handle value selection
  const handleValueSelect = React.useCallback((value: number) => {
    setSelectedValue(value);
    setShowConfirmDialog(true);
  }, []);

  // Handle sale confirmation
  const handleConfirmSale = React.useCallback(
    async (selectedVoucher: VoucherType | undefined, commissionData: CommissionData | null) => {
      if (!selectedCategory || !selectedValue || !terminal || !selectedVoucher) {
        return;
      }

      setIsSelling(true);
      setSaleError(null);

      try {
        const { data, error } = await sellVoucher({
          terminalId: terminal.terminal_id,
          voucherTypeId: selectedVoucher.id,
          amount: selectedValue,
        });

        if (error) {
          setSaleError(error.message);
          return;
        }

        if (data) {
          setSaleInfo({
            pin: data.voucher.pin,
            serial_number: data.voucher.serial_number,
          });

          const commissionAmount = commissionData?.amount || 0;
          const saleAmount = selectedValue;

          setReceiptData({
            ...data.receipt,
            voucherType: selectedCategory,
            amount: saleAmount,
            commissionAmount: commissionAmount,
            commissionRate: commissionData?.rate || 0,
          });

          // Update balance in context immediately after successful sale
          updateBalanceAfterSale(saleAmount, commissionAmount);

          // Also update the terminal object to reflect the new balance and credit
          setTerminal((prev) => {
            if (!prev) return prev;

            // Calculate new balance and credit - mirroring the logic in TerminalContext
            let newBalance = prev.retailer_balance;
            let newCreditUsed = prev.retailer_credit_used;

            if (prev.retailer_balance >= saleAmount) {
              // If balance covers the full amount
              newBalance = prev.retailer_balance - saleAmount + commissionAmount;
            } else {
              // If balance doesn't cover it, use credit for the remainder
              const amountFromCredit = saleAmount - prev.retailer_balance;
              newBalance = 0 + commissionAmount;
              newCreditUsed = prev.retailer_credit_used + amountFromCredit;
            }

            return {
              ...prev,
              retailer_balance: newBalance,
              retailer_credit_used: newCreditUsed,
            };
          });

          // Show success feedback
          setSaleComplete(true);
          setShowConfetti(true);
          setShowToast(true);
          setShowReceiptDialog(true);

          // Auto-hide confetti after 3 seconds
          setTimeout(() => {
            setShowConfetti(false);
          }, 3000);
        }
      } catch (error) {
        setSaleError(
          `Failed to process sale: ${error instanceof Error ? error.message : String(error)}`
        );
      } finally {
        setIsSelling(false);
        setShowConfirmDialog(false);
      }
    },
    [selectedCategory, selectedValue, terminal, updateBalanceAfterSale, setTerminal]
  );

  // Handle closing receipt
  const handleCloseReceipt = React.useCallback(() => {
    setShowReceiptDialog(false);
    setSaleComplete(false);
    setSelectedCategory(null);
    setSelectedValue(null);
  }, []);

  return {
    // State
    showConfirmDialog,
    selectedCategory,
    selectedValue,
    showConfetti,
    showToast,
    saleComplete,
    showReceiptDialog,
    isSelling,
    saleError,
    saleInfo,
    receiptData,

    // Actions
    setShowConfirmDialog,
    setSelectedCategory,
    setSelectedValue,
    setShowConfetti,
    setShowToast,
    setSaleComplete,
    setShowReceiptDialog,
    handleValueSelect,
    handleConfirmSale,
    handleCloseReceipt,
  };
}
