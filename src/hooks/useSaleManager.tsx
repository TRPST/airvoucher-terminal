import * as React from 'react';
import { sellVoucher, type VoucherType } from '@/actions';
import { useTerminal } from '@/contexts/TerminalContext';
import type { CashierTerminalProfile } from '@/actions';
import axios from 'axios';
import crypto from 'crypto-js';
import { createClient } from '@/utils/supabase/client';

// OTT API Configuration
const OTT_CONFIG = {
  BASE_URL: '/api/ott/reseller/v1',
  username: process.env.NEXT_PUBLIC_OTT_API_USERNAME!,
  password: process.env.NEXT_PUBLIC_OTT_API_PASSWORD!,
  apiKey: process.env.NEXT_PUBLIC_OTT_API_KEY!,
};

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
  const [saleInfo, setSaleInfo] = React.useState<SaleInfo | null>(null);
  const [receiptData, setReceiptData] = React.useState<ReceiptData | null>(null);

  const { updateBalanceAfterSale } = useTerminal();
  const supabase = createClient();

  // Handle value selection
  const handleValueSelect = React.useCallback((value: number) => {
    setSaleError(null); // Clear any previous errors
    setSelectedValue(value);
    setShowConfirmDialog(true);
  }, []);

  // OTT API Helper Functions
  const generateHash = (params: { [key: string]: any }) => {
    const sortedKeys = Object.keys(params).sort();
    const concatenatedString = [OTT_CONFIG.apiKey, ...sortedKeys.map((key) => params[key])].join(
      ''
    );
    return crypto.SHA256(concatenatedString).toString();
  };

  const getAuthHeaders = () => {
    const token = btoa(`${OTT_CONFIG.username}:${OTT_CONFIG.password}`);
    return { Authorization: `Basic ${token}` };
  };

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

          // Use the correct vendor code as per OTT documentation
          const vendorCode = 11; // Fixed vendor code as per OTT docs

          const params = {
            branch: 'DEFAULT_BRANCH',
            cashier: 'SYSTEM',
            mobileForSMS: '',
            till: 'WEB',
            uniqueReference,
            value: selectedValue,
            vendorCode: vendorCode,
          };

          const hash = generateHash(params);

          const response = await axios.post(
            '/api/ott/reseller/v1/GetVoucher',
            new URLSearchParams(
              Object.entries({ ...params, hash }).reduce(
                (acc, [key, value]) => {
                  acc[key] = String(value);
                  return acc;
                },
                {} as Record<string, string>
              )
            ),
            {
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );

          if (response.data.success === 'true') {
            const voucherData = JSON.parse(response.data.voucher);
            const voucherCode = voucherData.voucher_code || voucherData.pin;

            // Only get serial number from API response - no fallbacks
            const serialNumber =
              voucherData.serial_number || voucherData.serialNumber || voucherData.serial;

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

            // Get or create OTT voucher type
            let ottVoucherTypeId: string;
            const { data: ottVoucherType, error: voucherTypeError } = await supabase
              .from('voucher_types')
              .select('id')
              .eq('name', 'OTT')
              .single();

            if (voucherTypeError && voucherTypeError.code === 'PGRST116') {
              // OTT voucher type doesn't exist, create it
              const { data: newVoucherType, error: createTypeError } = await supabase
                .from('voucher_types')
                .insert({
                  name: 'OTT',
                  supplier_commission_pct: 0, // No supplier commission for OTT
                })
                .select('id')
                .single();

              if (createTypeError || !newVoucherType) {
                throw new Error('Failed to create OTT voucher type');
              }
              ottVoucherTypeId = newVoucherType.id;
            } else if (voucherTypeError) {
              throw new Error('Failed to check OTT voucher type');
            } else {
              ottVoucherTypeId = ottVoucherType.id;
            }

            // Create voucher inventory record for OTT sale (placeholder record)
            const { data: voucherInventory, error: inventoryError } = await supabase
              .from('voucher_inventory')
              .insert({
                voucher_type_id: ottVoucherTypeId,
                amount: selectedValue,
                pin: voucherCode,
                serial_number: serialNumber,
                status: 'sold', // Mark as sold immediately since it's generated via API
              })
              .select('id')
              .single();

            if (inventoryError || !voucherInventory) {
              throw new Error('Failed to create voucher inventory record');
            }

            // Create sales record for sales history
            const { error: salesError } = await supabase.from('sales').insert({
              terminal_id: terminal.terminal_id,
              voucher_inventory_id: voucherInventory.id,
              sale_amount: saleAmount,
              retailer_commission: commissionAmount,
              agent_commission: 0, // No agent commission for OTT
              supplier_commission: 0, // No supplier commission for OTT
              profit: saleAmount - commissionAmount, // Profit is sale amount minus retailer commission
              ref_number: uniqueReference,
            });

            if (salesError) {
              throw new Error(`Failed to create sales record: ${salesError.message}`);
            }

            // Update the voucher inventory record to set sold_at timestamp
            const { error: soldAtError } = await supabase
              .from('voucher_inventory')
              .update({ sold_at: new Date().toISOString() })
              .eq('id', voucherInventory.id);

            if (soldAtError) {
              // Don't fail the sale for this, just log it
              console.warn('Failed to update sold_at timestamp:', soldAtError);
            }

            setSaleInfo({
              pin: voucherCode,
              serial_number: serialNumber,
            });

            setReceiptData({
              voucherType: selectedCategory,
              amount: saleAmount,
              commissionAmount: commissionAmount,
              commissionRate: commissionData?.rate || 0,
              voucher_code: voucherCode,
              serial_number: serialNumber,
              ref_number: uniqueReference,
              timestamp: new Date().toISOString(),
              instructions: 'Use the voucher code to recharge your OTT account',
            });

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

            // Auto-hide confetti after 3 seconds
            setTimeout(() => {
              setShowConfetti(false);
            }, 3000);
          } else {
            // Handle specific error messages from OTT API
            const errorMessage = response.data.message || 'Failed to issue OTT voucher';

            if (
              errorMessage.toLowerCase().includes('invalid amount') ||
              errorMessage.toLowerCase().includes('minimum') ||
              errorMessage.toLowerCase().includes('denomination')
            ) {
              // Error code 3 means "Cannot Find a Matching Product for this value"
              // This means the amount is not available as a product in the OTT system
              throw new Error(
                `R${selectedValue} voucher is not available as an OTT product. Please try a different amount.`
              );
            } else if (errorMessage.toLowerCase().includes('insufficient')) {
              throw new Error('Insufficient balance with OTT provider');
            } else if (errorMessage.toLowerCase().includes('vendor')) {
              throw new Error('Vendor configuration error. Please contact support.');
            } else {
              throw new Error(`OTT API Error: ${errorMessage}`);
            }
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
        // Don't close the dialog on error - let the user see the error message
        return;
      } finally {
        setIsSelling(false);
      }

      // Only close dialog on successful completion
      setShowConfirmDialog(false);
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

  // Handle cancel dialog
  const handleCancelDialog = React.useCallback(() => {
    setSaleError(null); // Clear any errors
    setShowConfirmDialog(false);
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
    handleCancelDialog,
  };
}
