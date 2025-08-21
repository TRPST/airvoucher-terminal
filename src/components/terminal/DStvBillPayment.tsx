import * as React from 'react';
import { ChevronLeft, Tv, AlertCircle, CheckCircle, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { createClient } from '@/utils/supabase/client';
import { useTerminal } from '@/contexts/TerminalContext';
import type { CashierTerminalProfile } from '@/actions/cashierActions';

interface DStvBillPaymentProps {
  onBackToCategories: () => void;
  onPaymentComplete: (paymentData: any) => void;
  terminal: CashierTerminalProfile | null;
  setTerminal: React.Dispatch<React.SetStateAction<CashierTerminalProfile | null>>;
}

interface AccountValidationDetails {
  reference: string;
  amountDue: number;
  accountNumber: string;
  vendorId: string;
  productId: string;
  accountHolder: string;
}

export function DStvBillPayment({
  onBackToCategories,
  onPaymentComplete,
  terminal,
  setTerminal,
}: DStvBillPaymentProps) {
  // Terminal context for balance updates
  const supabase = createClient();

  // Generate unique reference for transactions
  const generateUniqueReference = () =>
    `ref-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

  const [step, setStep] = React.useState<'input' | 'confirm' | 'success'>('input');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [productId, setProductId] = React.useState('298'); // Default DStv product ID
  const [vendorId, setVendorId] = React.useState('198'); // Default DStv vendor ID
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [accountDetails, setAccountDetails] = React.useState<AccountValidationDetails | null>(null);
  const [paymentResult, setPaymentResult] = React.useState<any>(null);

  const handleValidateAccount = async () => {
    if (!accountNumber.trim() || !productId.trim() || !vendorId.trim()) {
      setError('Please enter a valid account number, product ID, and vendor ID.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestData = {
        accountNumber: accountNumber.trim(),
        productId: productId.trim(),
        vendorId: vendorId.trim(),
      };

      const response = await axios.post('/api/glocell/dstv/validateAccount', requestData);

      setAccountDetails(response.data);
      setStep('confirm');
    } catch (error: any) {
      console.error('Error validating account:', error);
      console.error('Validation error response data:', error.response?.data);
      console.error('Validation error response status:', error.response?.status);
      setError(error.response?.data?.message || 'Failed to validate account number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!accountDetails?.reference || !terminal) {
      setError(
        'No transaction reference found or terminal not available. Please go back and try again.'
      );
      return;
    }

    // Validate sufficient balance and credit before processing
    const saleAmount = accountDetails.amountDue / 100; // Convert from cents to rands
    const availableCredit = terminal.retailer_credit_limit - terminal.retailer_credit_used;
    const totalAvailable = terminal.retailer_balance + availableCredit;

    if (totalAvailable < saleAmount) {
      setError(
        `Insufficient balance and credit. Available: R${totalAvailable.toFixed(2)}, Required: R${saleAmount.toFixed(2)}`
      );
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestData = {
        reference: accountDetails.reference,
        accountNumber: accountNumber,
        productId: productId,
        vendorId: vendorId,
        amountDue: accountDetails.amountDue,
      };

      const response = await axios.post('/api/glocell/dstv/processPayment', requestData);

      // If payment is successful, update balance and credit
      if (response.data) {
        // Validate terminal data
        if (!terminal.retailer_id) {
          throw new Error('Invalid terminal data: missing retailer_id');
        }

        const saleAmount = accountDetails.amountDue / 100; // Convert from cents to rands
        const commissionAmount = 0; // DStv typically has no commission
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

        const { error: updateError } = await supabase
          .from('retailers')
          .update({
            balance: safeBalance,
            credit_used: safeCreditUsed,
            commission_balance: baseCommissionBalance + commissionAmount,
          })
          .eq('id', terminal.retailer_id);

        if (updateError) {
          console.error('Database update error (DStv):', updateError);
          throw new Error(`Failed to update retailer balance: ${updateError.message}`);
        }

        // For DStv (bill settlement), we do not create voucher inventory or sales records.
        // We only log a transaction record with detailed notes and update balances above.

        const transactionNotes = (() => {
          const parts: string[] = [];
          parts.push('DStv Bill Payment');
          if (amountFromCredit > 0) {
            parts.push(
              `Split: R${(saleAmount - amountFromCredit).toFixed(2)} from balance, R${amountFromCredit.toFixed(2)} from credit`
            );
          } else {
            parts.push('Paid fully from balance');
          }
          if (response.data?.paymentReference || response.data?.reference) {
            parts.push(`Ref: ${response.data.paymentReference ?? response.data.reference}`);
          }
          if (response.data?.status) {
            parts.push(`Status: ${response.data.status}`);
          }
          return parts.join(' | ');
        })();

        const { error: transactionError } = await supabase.from('transactions').insert({
          type: 'sale',
          amount: saleAmount,
          balance_after: safeBalance,
          retailer_id: terminal.retailer_id,
          notes: transactionNotes,
        });

        if (transactionError) {
          console.error('Transaction creation error (DStv):', transactionError);
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
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      setError(error.response?.data?.message || 'Payment processing failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'confirm') {
      setStep('input');
      setAccountDetails(null);
    } else {
      onBackToCategories();
    }
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
        <h2 className="text-xl font-bold">DStv Bill Payment</h2>
        <div className="w-20"></div>
      </div>
      <div className="mx-auto max-w-md space-y-6">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold">Enter Account Details</h3>
          <p className="text-sm text-muted-foreground">
            Enter the DStv account number, product ID, and vendor ID to continue.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter DStv account number"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Product ID</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 298"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Vendor ID</label>
            <input
              type="text"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 198"
            />
          </div>
          {error && (
            <div className="flex items-center space-x-2 rounded-md bg-red-500/10 p-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <Button
            onClick={handleValidateAccount}
            disabled={isLoading || !accountNumber || !productId || !vendorId}
            className="w-full"
          >
            {isLoading ? 'Validating...' : 'Validate Account'}
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
          <h3 className="text-lg font-semibold">Please Confirm Account Details</h3>
          <p className="text-sm text-muted-foreground">
            Ensure the following details are correct before proceeding with the payment.
          </p>
        </div>
        {accountDetails && (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex items-start space-x-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Holder</p>
                <p className="font-semibold">{accountDetails.accountHolder}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CreditCard className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                <p className="font-semibold">{accountDetails.accountNumber}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Tv className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Due</p>
                <p className="font-semibold">R {(accountDetails.amountDue / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center space-x-2 rounded-md bg-red-500/10 p-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <Button onClick={handleProcessPayment} disabled={isLoading} className="w-full">
          {isLoading
            ? 'Processing Payment...'
            : `Pay R ${accountDetails ? (accountDetails.amountDue / 100).toFixed(2) : '0.00'}`}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h2 className="text-xl font-bold">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground">
              Your DStv bill payment has been processed successfully.
            </p>
          </div>
          {paymentResult && (
            <div className="space-y-3 rounded-lg bg-muted p-4 text-left">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">R {(paymentResult.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account:</span>
                <span className="font-medium">{paymentResult.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account Holder:</span>
                <span className="font-medium">{paymentResult.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Reference:</span>
                <span className="font-medium">{paymentResult.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vendor Reference:</span>
                <span className="font-medium">{paymentResult.vendorReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service Provider:</span>
                <span className="font-medium">{paymentResult.serviceProviderName}</span>
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

  switch (step) {
    case 'input':
      return renderInputStep();
    case 'confirm':
      return renderConfirmStep();
    case 'success':
      return renderSuccessStep();
    default:
      return renderInputStep();
  }
} 