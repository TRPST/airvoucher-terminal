import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Zap,
  AlertCircle,
  CheckCircle,
  User,
  Home,
  CreditCard,
  X,
} from 'lucide-react';
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';
import { useTerminal } from '@/contexts/TerminalContext';
import type { CashierTerminalProfile } from '@/actions/cashierActions';

// React Error Boundary Component
class ElectricityErrorBoundary extends React.Component<
  { children: React.ReactNode; onBackToCategories: () => void },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode; onBackToCategories: () => void }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: any) {
    console.error('ElectricityErrorBoundary caught error:', error);
    return { hasError: true, errorMessage: 'An unexpected error occurred. Please try again.' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ElectricityErrorBoundary error details:', error, errorInfo);

    // Handle specific error types
    if (error?.response?.status === 502) {
      this.setState({
        errorMessage:
          'The electricity service is experiencing technical difficulties. Please try again later.',
      });
    } else if (error?.response?.status === 400) {
      this.setState({
        errorMessage:
          'Invalid meter number or request format. Please check the meter number and try again.',
      });
    } else if (error?.response?.status === 404) {
      this.setState({
        errorMessage: 'Meter number not found. Please verify the meter number is correct.',
      });
    } else if (error?.response?.status === 500) {
      this.setState({
        errorMessage: 'Internal server error. Please try again later.',
      });
    } else if (error?.code === 'NETWORK_ERROR' || error?.code === 'ERR_NETWORK') {
      this.setState({
        errorMessage:
          'Network connection error. Please check your internet connection and try again.',
      });
    } else if (error?.code === 'ERR_BAD_RESPONSE') {
      this.setState({
        errorMessage: 'Service temporarily unavailable. Please try again later.',
      });
    } else {
      this.setState({
        errorMessage: 'An unexpected error occurred. Please try again.',
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-background">
          <div className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between px-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={this.props.onBackToCategories}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h2 className="text-xl font-bold">Electricity</h2>
              <div className="w-20"></div>
            </div>
            <div className="mx-auto max-w-md space-y-6 text-center">
              <div className="rounded-md bg-red-500/10 p-4">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
                <h3 className="text-lg font-semibold text-red-600">Service Error</h3>
                <p className="text-sm text-red-700">{this.state.errorMessage}</p>
              </div>
              <Button onClick={this.props.onBackToCategories} className="w-full">
                Return to Main Menu
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ConfirmationDetails {
  reference: string;
  customerName: string;
  address: string;
  utility: string;
  amount: number;
  consumer?: {
    name: string;
    address: string;
  };
}

interface ElectricityBillPaymentProps {
  onBackToCategories: () => void;
  onPaymentComplete: (result: any) => void;
  terminal: CashierTerminalProfile | null;
  setTerminal: React.Dispatch<React.SetStateAction<CashierTerminalProfile | null>>;
}

export function ElectricityBillPayment({
  onBackToCategories,
  onPaymentComplete,
  terminal,
  setTerminal,
}: ElectricityBillPaymentProps) {
  // Component-level error state
  const [hasComponentError, setHasComponentError] = React.useState(false);
  const [componentErrorMessage, setComponentErrorMessage] = React.useState('');

  // Terminal context for balance updates
  const supabase = createClient();

  // Generate unique reference for transactions
  const generateUniqueReference = () =>
    `ref-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  const [step, setStep] = React.useState<'input' | 'confirm' | 'success'>('input');
  const [meterNumber, setMeterNumber] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [transactionType, setTransactionType] = React.useState('Syntell');
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationDetails, setConfirmationDetails] = React.useState<ConfirmationDetails | null>(
    null
  );
  const [paymentResult, setPaymentResult] = React.useState<any>(null);

  // Modal state for error handling
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const predefinedAmounts = [50, 100, 200, 500, 1000, 2000];
  const transactionTypes = [
    { value: 'Syntell', label: 'Syntell' },
    { value: 'MeterMan', label: 'MeterMan' },
    { value: 'EkurhuleniDirectIMS', label: 'Ekurhuleni Direct IMS' },
  ];

  // Global error handler to catch any unhandled errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();

      let message = 'An unexpected error occurred. Please try again.';

      // Handle specific API error responses based on documentation
      if (event.reason?.response?.status === 502) {
        message =
          'The electricity service is experiencing technical difficulties. Please try again later.';
      } else if (event.reason?.response?.status === 400) {
        message =
          'Invalid meter number or request format. Please check the meter number and try again.';
      } else if (event.reason?.response?.status === 401) {
        message = 'Authentication failed. Please contact support.';
      } else if (event.reason?.response?.status === 403) {
        message = 'Access denied. Please contact support.';
      } else if (event.reason?.response?.status === 404) {
        message = 'Meter number not found. Please verify the meter number is correct.';
      } else if (event.reason?.response?.status === 409) {
        message = 'Transaction conflict. Please try again or contact support.';
      } else if (event.reason?.response?.status === 500) {
        message = 'Internal server error. Please try again later.';
      } else if (event.reason?.response?.status === 504) {
        message = 'Request timed out. Please try again.';
      } else if (event.reason?.code === 'NETWORK_ERROR' || event.reason?.code === 'ERR_NETWORK') {
        message = 'Network connection error. Please check your internet connection and try again.';
      } else if (event.reason?.code === 'ERR_BAD_RESPONSE') {
        message = 'Service temporarily unavailable. Please try again later.';
      } else if (event.reason?.code === 'ECONNABORTED') {
        message = 'Request timed out. Please try again.';
      } else if (event.reason?.response?.data?.message) {
        message = event.reason.response.data.message;
      }

      setErrorMessage(message);
      setShowErrorModal(true);
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      event.preventDefault();

      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Component error boundary
  if (hasComponentError) {
    return (
      <div className="h-full bg-background">
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center justify-between px-4 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToCategories}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h2 className="text-xl font-bold">Electricity</h2>
            <div className="w-20"></div>
          </div>
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="rounded-md bg-red-500/10 p-4">
              <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">Service Error</h3>
              <p className="text-sm text-red-700">{componentErrorMessage}</p>
            </div>
            <Button onClick={onBackToCategories} className="w-full">
              Return to Main Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmCustomer = async () => {
    if (!meterNumber.trim() || !amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid meter number and amount.');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        '/api/glocell/electricity/confirmCustomer',
        {
          meterNumber: meterNumber.trim(),
          amount: parseFloat(amount),
          transactionType: transactionType,
        },
        {
          timeout: 30000,
        }
      );

      setConfirmationDetails(response.data);
      setStep('confirm');
    } catch (error: any) {
      console.error('Error confirming customer:', error);

      let message = 'An unexpected error occurred. Please try again.';

      // Handle specific API error responses based on documentation
      if (error.response?.status === 502) {
        message =
          'The electricity service is experiencing technical difficulties. Please try again later.';
      } else if (error.response?.status === 400) {
        message =
          'Invalid meter number or request format. Please check the meter number and try again.';
      } else if (error.response?.status === 401) {
        message = 'Authentication failed. Please contact support.';
      } else if (error.response?.status === 403) {
        message = 'Access denied. Please contact support.';
      } else if (error.response?.status === 404) {
        message = 'Meter number not found. Please verify the meter number is correct.';
      } else if (error.response?.status === 409) {
        message = 'Transaction conflict. Please try again or contact support.';
      } else if (error.response?.status === 500) {
        message =
          'Electricity service is currently unavailable. Please try again later or contact support.';
      } else if (error.response?.status === 504) {
        message = 'Request timed out. Please try again.';
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        message = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_BAD_RESPONSE') {
        message = 'Service temporarily unavailable. Please try again later.';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please try again.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendPayment = async () => {
    if (!confirmationDetails?.reference || !terminal) {
      setErrorMessage(
        'No transaction reference found or terminal not available. Please go back and try again.'
      );
      setShowErrorModal(true);
      return;
    }

    // Validate sufficient balance and credit before processing
    const candidateAmounts = [
      (confirmationDetails as any)?.amount,
      amount, // user input (string)
      (paymentResult as any)?.amount,
      (paymentResult as any)?.vendResult?.amount,
    ];
    const saleAmount = candidateAmounts
      .map((v) => (typeof v === 'string' ? Number.parseFloat(v) : Number(v)))
      .find((v) => Number.isFinite(v) && v > 0) as number | undefined;
    if (!saleAmount) {
      throw new Error('Invalid sale amount returned from provider');
    }
    const availableCredit = terminal.retailer_credit_limit - terminal.retailer_credit_used;
    const totalAvailable = terminal.retailer_balance + availableCredit;

    if (totalAvailable < saleAmount) {
      setErrorMessage(
        `Insufficient balance and credit. Available: R${totalAvailable.toFixed(2)}, Required: R${saleAmount.toFixed(2)}`
      );
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        '/api/glocell/electricity/vend',
        {
          reference: confirmationDetails.reference,
          meterNumber: meterNumber,
        },
        {
          timeout: 30000,
        }
      );

      // If payment is successful, update balance and credit
      if (response.data) {
        // Validate terminal data
        if (!terminal.retailer_id) {
          throw new Error('Invalid terminal data: missing retailer_id');
        }

        // Validate and coerce sale amount to a finite number (fallbacks: confirm details -> input -> vend response -> decode reference)
        const candidateAmounts = [
          (confirmationDetails as any)?.amount,
          amount, // user input (string)
          (response as any)?.data?.amount,
          (response as any)?.data?.vendResult?.amount,
        ];

        let resolvedAmount = candidateAmounts
          .map((v) => (typeof v === 'string' ? Number.parseFloat(v) : Number(v)))
          .find((v) => Number.isFinite(v) && v > 0) as number | undefined;

        if (!resolvedAmount) {
          // Try decoding reference payload (often contains amount in cents)
          try {
            const refStr = (confirmationDetails as any)?.reference as string | undefined;
            if (refStr) {
              const decoded =
                typeof atob !== 'undefined'
                  ? atob(refStr)
                  : Buffer.from(refStr, 'base64').toString('utf-8');
              const refJson = JSON.parse(decoded);
              const cents = Number(refJson?.details?.amount);
              if (Number.isFinite(cents) && cents > 0) {
                resolvedAmount = cents / 100;
              }
            }
          } catch (e) {
            // ignore and fall through to validation error
          }
        }

        const saleAmount = resolvedAmount as number | undefined;
        if (!saleAmount) {
          throw new Error('Invalid sale amount returned from provider');
        }
        const commissionAmount = 0; // Electricity typically has no commission
        let newBalance = terminal.retailer_balance ?? 0;
        let newCreditUsed = terminal.retailer_credit_used ?? 0;
        let amountFromCredit = 0;

        if (newBalance >= saleAmount) {
          // If balance covers the full amount
          newBalance = newBalance - saleAmount + commissionAmount;
        } else {
          // If balance doesn't cover it, use credit for the remainder
          amountFromCredit = saleAmount - newBalance;
          newBalance = 0 + commissionAmount;
          newCreditUsed = newCreditUsed + amountFromCredit;
        }

        // Ensure non-null, finite numbers before DB write
        const safeBalance = Number.isFinite(newBalance) ? newBalance : 0;
        const safeCreditUsed = Number.isFinite(newCreditUsed) ? newCreditUsed : 0;
        const baseCommissionBalance = Number.isFinite(Number(terminal.retailer_commission_balance))
          ? Number(terminal.retailer_commission_balance)
          : 0;

        // Do not update retailer directly here; RPC will do atomic update

        // Create or find Electricity voucher type (robust against duplicates)
        let electricityVoucherTypeId: string | null = null;
        let electricitySupplierCommissionPct: number = 0;

        const vtSelect = await supabase
          .from('voucher_types')
          .select('id, supplier_commission_pct')
          .eq('name', 'Electricity')
          .limit(1);

        if (vtSelect.error) {
          console.error('Voucher type select error (Electricity):', vtSelect.error);
        }

        if (vtSelect.data && vtSelect.data.length > 0) {
          electricityVoucherTypeId = vtSelect.data[0].id as string;
          electricitySupplierCommissionPct =
            (vtSelect.data[0].supplier_commission_pct as number) ?? 0;
        } else {
          const vtUpsert = await supabase
            .from('voucher_types')
            .upsert({ name: 'Electricity', supplier_commission_pct: 0.0 }, { onConflict: 'name' })
            .select('id, supplier_commission_pct')
            .limit(1);

          if (vtUpsert.error || !vtUpsert.data || vtUpsert.data.length === 0) {
            throw new Error('Failed to create Electricity voucher type');
          }

          electricityVoucherTypeId = vtUpsert.data[0].id as string;
          electricitySupplierCommissionPct =
            (vtUpsert.data[0].supplier_commission_pct as number) ?? 0;
        }

        if (!electricityVoucherTypeId) {
          throw new Error('Failed to resolve Electricity voucher type');
        }

        // Prefer real electricity token from vend response; fallback to UUID to ensure uniqueness
        const electricityToken =
          response.data?.token ||
          response.data?.tokenNumber ||
          response.data?.vendResult?.token ||
          (Array.isArray(response.data?.tokens) ? response.data.tokens[0]?.token : undefined) ||
          response.data?.electricityToken;
        const pinValue =
          electricityToken ??
          (typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

        // Create or reuse voucher inventory record for Electricity sale (pin must be unique)
        let voucherInventoryId: string | null = null;
        let skippedInventory = false;
        const upsertPayload = {
          voucher_type_id: electricityVoucherTypeId,
          amount: saleAmount,
          pin: pinValue,
          serial_number: confirmationDetails.reference,
          status: 'available',
        } as const;

        try {
          let upsertResult = await supabase
            .from('voucher_inventory')
            .upsert(upsertPayload, { onConflict: 'pin' })
            .select('id')
            .single();

          if (upsertResult.error) {
            console.error('Voucher inventory upsert error (Electricity):', upsertResult.error);
            // Fallback: try to fetch existing voucher by pin (in case of race condition or policy)
            const fallback = await supabase
              .from('voucher_inventory')
              .select('id')
              .eq('pin', pinValue)
              .single();

            if (fallback.data && !fallback.error) {
              voucherInventoryId = fallback.data.id;
            } else {
              // Policy may disallow select; skip inventory creation but continue with transaction
              skippedInventory = true;
            }
          } else {
            voucherInventoryId = upsertResult.data?.id ?? null;
            if (!voucherInventoryId) {
              // Upsert succeeded but no row returned (likely RLS select denied); continue without inventory id
              skippedInventory = true;
            }
          }
        } catch (invErr) {
          console.error('Voucher inventory operation exception (Electricity):', invErr);
          skippedInventory = true;
        }

        // Calculate supplier commission using the rate from database
        const supplierCommission = saleAmount * (electricitySupplierCommissionPct / 100);

        // If we have an inventory id, complete sale via existing RPC (atomic balance/credit/transaction/sale)
        if (voucherInventoryId) {
          try {
            const { completeVoucherSale } = await import('@/lib/sale/completeVoucherSale');
            const { data: receipt, error: rpcError } = await completeVoucherSale({
              voucher_inventory_id: voucherInventoryId,
              retailer_id: terminal.retailer_id,
              terminal_id: terminal.terminal_id,
              in_voucher_type_id: electricityVoucherTypeId,
              sale_amount: saleAmount,
              retailer_commission_pct: 0,
              agent_commission_pct: 0,
            });

            if (rpcError) {
              console.error('RPC complete_voucher_sale error (Electricity):', rpcError);
              // Fall back to client-side transaction creation below
            } else if (receipt) {
              // Normalize paymentResult for success modal using RPC receipt voucher_code if vendor response lacks token array
              const normalizedResult: any = {
                ...response.data,
              };
              const codeFromReceipt = receipt.voucher_code;
              if (codeFromReceipt) {
                normalizedResult.tokens = [{ token: codeFromReceipt }];
              }

              // Let RPC update balances; reflect state locally
              setTerminal((prev) =>
                prev
                  ? { ...prev, retailer_balance: newBalance, retailer_credit_used: newCreditUsed }
                  : prev
              );
              setPaymentResult(normalizedResult);
              setStep('success');
              // Pass receipt to parent for global receipt modal
              onPaymentComplete(receipt);
              return; // Done via RPC path
            }
          } catch (e) {
            console.error('Error calling complete_voucher_sale (Electricity):', e);
            // Fall through to client-side transaction path
          }
        }

        // Fallback: create sale record for sales history (if inventory not stored or RPC failed)
        if (voucherInventoryId) {
          const { error: salesError } = await supabase.from('sales').insert({
            voucher_inventory_id: voucherInventoryId,
            terminal_id: terminal.terminal_id,
            sale_amount: saleAmount,
            supplier_commission: supplierCommission,
            retailer_commission: commissionAmount,
            agent_commission: 0,
            profit: supplierCommission - commissionAmount,
            ref_number: generateUniqueReference(),
          });

          if (salesError) {
            console.error('Sales record create error (Electricity):', salesError);
          }
        }

        // Create transaction record (always)
        const transactionNotesParts: string[] = [];
        transactionNotesParts.push('Electricity Payment');
        if (amountFromCredit > 0) {
          transactionNotesParts.push(
            `Split: R${(saleAmount - amountFromCredit).toFixed(2)} from balance, R${amountFromCredit.toFixed(2)} from credit`
          );
        } else {
          transactionNotesParts.push('Paid fully from balance');
        }
        if (electricityToken) {
          transactionNotesParts.push(`Token: ${electricityToken}`);
        }
        transactionNotesParts.push(`Ref: ${confirmationDetails.reference}`);
        if (skippedInventory) {
          transactionNotesParts.push('Inventory record not stored (policy)');
        }
        const transactionNotes = transactionNotesParts.join(' | ');

        const { error: transactionError } = await supabase.from('transactions').insert({
          type: 'sale',
          amount: saleAmount,
          balance_after: safeBalance,
          retailer_id: terminal.retailer_id,
          notes: transactionNotes,
        });

        if (transactionError) {
          console.error('Transaction creation error (Electricity):', transactionError);
          throw new Error(`Failed to create transaction record: ${transactionError.message}`);
        }

        // Note: We're handling balance updates directly in the database and terminal state
        // The context updateBalanceAfterSale is not needed since we're managing state directly

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
      }

      setPaymentResult(response.data);
      setStep('success');
      onPaymentComplete(response.data);
    } catch (error: any) {
      console.error('Error processing payment:', error);

      let message = 'Payment processing failed. Please try again.';

      // Handle specific API error responses based on documentation
      if (error.response?.status === 502) {
        message =
          'The payment service is experiencing technical difficulties. Please try again later.';
      } else if (error.response?.status === 400) {
        message = 'Invalid payment request. Please go back and try again.';
      } else if (error.response?.status === 401) {
        message = 'Authentication failed. Please contact support.';
      } else if (error.response?.status === 403) {
        message = 'Access denied. Please contact support.';
      } else if (error.response?.status === 404) {
        message = 'Transaction reference not found. Please go back and try again.';
      } else if (error.response?.status === 409) {
        message = 'Transaction conflict. Please try again or contact support.';
      } else if (error.response?.status === 500) {
        message =
          'Electricity service is currently unavailable. Please try again later or contact support.';
      } else if (error.response?.status === 504) {
        message = 'Request timed out. Please try again.';
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        message = 'Network connection error. Please check your internet connection and try again.';
      } else if (error.code === 'ERR_BAD_RESPONSE') {
        message = 'Service temporarily unavailable. Please try again later.';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please try again.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('input');
      setConfirmationDetails(null);
    } else {
      onBackToCategories();
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  // Error Modal Component
  const ErrorModal = () => {
    if (!showErrorModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Error</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={closeErrorModal} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mb-6 text-sm text-gray-600">{errorMessage}</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeErrorModal}>
              OK
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderInputStep = () => (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToCategories}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-bold">Electricity</h2>
        <div className="w-20"></div>
      </div>
      <div className="mx-auto max-w-md space-y-6">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold">Enter Meter and Amount</h3>
          <p className="text-sm text-muted-foreground">
            Enter the meter number and desired amount to continue.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            For testing, use valid meter numbers like: 00000100000, 00001100000, 00000100100
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Meter Number</label>
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter meter number"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Transaction Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Amount (R)</label>
            <div className="mb-2 grid grid-cols-3 gap-2">
              {predefinedAmounts.map((predefinedAmount) => (
                <Button
                  key={predefinedAmount}
                  variant={amount === predefinedAmount.toString() ? 'default' : 'outline'}
                  onClick={() => setAmount(predefinedAmount.toString())}
                >
                  R {predefinedAmount}
                </Button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Or enter custom amount"
            />
          </div>
          <Button
            onClick={handleConfirmCustomer}
            disabled={isLoading || !meterNumber || !amount}
            className="w-full"
          >
            {isLoading ? 'Confirming...' : 'Confirm Meter Details'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-bold">Confirm Details</h2>
        <div className="w-20"></div>
      </div>
      <div className="mx-auto max-w-md space-y-6">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold">Please Confirm Customer Details</h3>
          <p className="text-sm text-muted-foreground">
            Ensure the following details are correct before proceeding with the payment.
          </p>
        </div>
        {confirmationDetails && (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex items-start space-x-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-semibold">
                  {confirmationDetails.customerName || confirmationDetails.consumer?.name || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Home className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-semibold">
                  {confirmationDetails.address || confirmationDetails.consumer?.address || 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utility</p>
                <p className="font-semibold">{confirmationDetails.utility}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CreditCard className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="font-semibold">R {confirmationDetails.amount || amount}</p>
              </div>
            </div>
          </div>
        )}
        <Button onClick={handleVendPayment} disabled={isLoading} className="w-full">
          {isLoading ? 'Processing Payment...' : 'Confirm'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => {
    const token = paymentResult?.tokens?.[0];
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h2 className="text-xl font-bold">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground">
              Your electricity token has been generated.
            </p>
          </div>
          {paymentResult && (
            <div className="space-y-3 rounded-lg bg-muted p-4 text-left">
              <div className="mb-3 border-b pb-3 text-center">
                <p className="text-sm text-muted-foreground">Token</p>
                <p className="text-lg font-bold tracking-wider">{token?.token || 'N/A'}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">R {(paymentResult.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Utility:</span>
                <span className="font-medium">{paymentResult.utility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Meter:</span>
                <span className="font-medium">{paymentResult.meter.meterNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference:</span>
                <span className="font-medium">{paymentResult.reference}</span>
              </div>
            </div>
          )}
          <Button onClick={onBackToCategories} className="w-full">
            New Sale
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ElectricityErrorBoundary onBackToCategories={onBackToCategories}>
      <ErrorModal />
      <div className="flex h-full flex-col">
        {step === 'input' && renderInputStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </ElectricityErrorBoundary>
  );
}
