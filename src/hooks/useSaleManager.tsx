import * as React from 'react';
import { sellVoucher, type VoucherType } from '@/actions';
import { useTerminal } from '@/contexts/TerminalContext';
import type { CashierTerminalProfile } from '@/actions';
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';

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
  isOverride: boolean;
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

  const clearSaleError = () => {
    setSaleError(null);
  };
  const [saleInfo, setSaleInfo] = React.useState<SaleInfo | null>(null);
  const [receiptData, setReceiptData] = React.useState<ReceiptData | null>(null);

  const { updateBalanceAfterSale } = useTerminal();
  const supabase = createClient();

  // Handle value selection
  const handleValueSelect = React.useCallback((value: number) => {
    setSelectedValue(value);
    setShowConfirmDialog(true);
  }, []);

  const generateUniqueReference = () =>
    `ref-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  // Handle sale confirmation
  const handleConfirmSale = React.useCallback(
    async (selectedVoucher: VoucherType | undefined, commissionData: CommissionData | null) => {
      if (!selectedCategory || !selectedValue || !terminal) {
        return;
      }

      setIsSelling(true);
      setSaleError(null);

      try {
        if (selectedCategory === 'OTT') {
          // Handle OTT sale
          const uniqueReference = generateUniqueReference();
          const params = {
            branch: 'DEFAULT_BRANCH',
            cashier: 'SYSTEM',
            mobileForSMS: '',
            till: 'WEB',
            uniqueReference,
            value: selectedValue,
            vendorCode: '11',
          };

          const response = await axios.post('/api/ott/reseller/v1/GetVoucher', params, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.data.success === 'true') {
            const voucherData = JSON.parse(response.data.voucher);
            console.log('OTT API Response Data:', response.data);
            console.log('Parsed Voucher Data:', voucherData);

            const voucherCode = voucherData.voucher_code || voucherData.pin;
            const serialNumber = voucherData.serial_number || voucherData.serialNumber;

            // Calculate new balance and credit
            const saleAmount = selectedValue;
            const commissionAmount = commissionData?.amount || 0;
            let newBalance = terminal.retailer_balance;
            let newCreditUsed = terminal.retailer_credit_used;

            if (terminal.retailer_balance >= saleAmount) {
              // If balance covers the full amount
              newBalance = terminal.retailer_balance - saleAmount + commissionAmount;
            } else {
              // If balance doesn't cover it, use credit for the remainder
              const amountFromCredit = saleAmount - terminal.retailer_balance;
              newBalance = 0 + commissionAmount;
              newCreditUsed = terminal.retailer_credit_used + amountFromCredit;
            }

            // Update retailer balance in database
            const { error: updateError } = await supabase
              .from('retailers')
              .update({
                balance: newBalance,
                credit_used: newCreditUsed,
                commission_balance: terminal.retailer_commission_balance + commissionAmount,
              })
              .eq('id', terminal.retailer_id);

            if (updateError) {
              throw new Error('Failed to update retailer balance');
            }

            // Create or find OTT voucher type
            let ottVoucherTypeId = null;
            let ottSupplierCommissionPct = null;
            const { data: existingOttType, error: ottTypeError } = await supabase
              .from('voucher_types')
              .select('id, supplier_commission_pct')
              .eq('name', 'OTT')
              .single();

            if (existingOttType) {
              ottVoucherTypeId = existingOttType.id;
              ottSupplierCommissionPct = existingOttType.supplier_commission_pct;
            } else {
              // Create OTT voucher type if it doesn't exist (with default 5% - can be changed later)
              const { data: newOttType, error: createTypeError } = await supabase
                .from('voucher_types')
                .insert({
                  name: 'OTT',
                  supplier_commission_pct: 5.0, // Default 5% - can be updated later in admin
                })
                .select('id, supplier_commission_pct')
                .single();

              if (createTypeError) {
                throw new Error('Failed to create OTT voucher type');
              }
              ottVoucherTypeId = newOttType.id;
              ottSupplierCommissionPct = newOttType.supplier_commission_pct;
            }

            // Create voucher inventory record for OTT sale
            const { data: voucherInventory, error: voucherInventoryError } = await supabase
              .from('voucher_inventory')
              .insert({
                voucher_type_id: ottVoucherTypeId,
                amount: saleAmount,
                pin: voucherCode,
                serial_number: serialNumber,
                status: 'sold',
              })
              .select('id')
              .single();

            if (voucherInventoryError) {
              throw new Error('Failed to create voucher inventory record');
            }

            // Calculate supplier commission using the rate from database
            const supplierCommission = saleAmount * (ottSupplierCommissionPct / 100);

            // Create sale record for sales history
            const { error: salesError } = await supabase.from('sales').insert({
              voucher_inventory_id: voucherInventory.id,
              terminal_id: terminal.terminal_id,
              sale_amount: saleAmount,
              supplier_commission: supplierCommission,
              retailer_commission: commissionAmount,
              agent_commission: 0,
              profit: supplierCommission - commissionAmount,
              ref_number: uniqueReference,
            });

            if (salesError) {
              throw new Error('Failed to create sales record');
            }

            // Create transaction record
            const { error: transactionError } = await supabase.from('transactions').insert({
              type: 'sale',
              amount: saleAmount,
              balance_after: newBalance,
              retailer_id: terminal.retailer_id,
              notes: 'OTT Voucher Sale',
            });

            if (transactionError) {
              throw new Error('Failed to create transaction record');
            }

            setSaleInfo({
              pin: voucherCode,
              serial_number: serialNumber,
            });

            const receiptData = {
              voucherType: selectedCategory,
              amount: saleAmount,
              commissionAmount: commissionAmount,
              commissionRate: commissionData?.rate || 0,
              voucher_code: voucherCode,
              serial_number: serialNumber,
              ref_number: uniqueReference,
              timestamp: new Date().toISOString(),
              instructions: 'Use the voucher code to recharge your OTT account',
            };

            console.log('Receipt Data for OTT Sale:', receiptData);
            setReceiptData(receiptData);

            // Update balance in context immediately after successful sale
            updateBalanceAfterSale(saleAmount, commissionAmount);

            // Also update the terminal object to reflect the new balance and credit
            setTerminal((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                retailer_balance: newBalance,
                retailer_credit_used: newCreditUsed,
                retailer_commission_balance: prev.retailer_commission_balance + commissionAmount,
              };
            });

            // Show success feedback
            setSaleComplete(true);
            setShowConfetti(true);
            setShowToast(true);
            setShowReceiptDialog(true);
            setShowConfirmDialog(false);

            // Auto-hide confetti after 3 seconds
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
          } else {
            throw new Error(response.data.message || 'Failed to issue OTT voucher');
          }
        } else {
          // Handle regular voucher sale
          if (!selectedVoucher) return;

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
            setShowConfirmDialog(false);

            // Auto-hide confetti after 3 seconds
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
          }
        }
      } catch (error) {
        setSaleError(
          `Failed to process sale: ${error instanceof Error ? error.message : String(error)}`
        );
        setIsSelling(false);
        // Don't close the dialog on error so user can see the error and try again
        return;
      } finally {
        setIsSelling(false);
      }
    },
    [selectedCategory, selectedValue, terminal, updateBalanceAfterSale, setTerminal, supabase]
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
    clearSaleError,
  };
}
