import * as React from 'react';
import { ChevronLeft, Zap, AlertCircle, CheckCircle, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface ElectricityBillPaymentProps {
  onBackToCategories: () => void;
  onPaymentComplete: (paymentData: any) => void;
}

interface ConfirmationDetails {
  utility: string;
  consumer: {
    name: string;
    address: string;
  };
  reference: string;
}

export function ElectricityBillPayment({
  onBackToCategories,
  onPaymentComplete,
}: ElectricityBillPaymentProps) {
  const [step, setStep] = React.useState<'input' | 'confirm' | 'success'>('input');
  const [meterNumber, setMeterNumber] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [confirmationDetails, setConfirmationDetails] = React.useState<ConfirmationDetails | null>(
    null
  );
  const [paymentResult, setPaymentResult] = React.useState<any>(null);

  const predefinedAmounts = [50, 100, 200, 500, 1000, 2000];

  const handleConfirmCustomer = async () => {
    if (!meterNumber.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid meter number and amount.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/glocell/electricity/confirmCustomer', {
        meterNumber: meterNumber.trim(),
        amount: parseFloat(amount),
      });

      setConfirmationDetails(response.data);
      setStep('confirm');
    } catch (error: any) {
      console.error('Error confirming customer:', error);
      setError(error.response?.data?.message || 'Failed to confirm meter number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVendPayment = async () => {
    if (!confirmationDetails?.reference) {
      setError('No transaction reference found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/glocell/electricity/vend', {
        transactionReference: confirmationDetails.reference,
        meterNumber: meterNumber,
      });

      setPaymentResult(response.data);
      setStep('success');
      onPaymentComplete(response.data);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.response?.data?.message || 'Payment processing failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'confirm') {
      setStep('input');
      setConfirmationDetails(null);
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
        <h2 className="text-xl font-bold">Electricity</h2>
        <div className="w-20"></div>
      </div>
      <div className="mx-auto max-w-md space-y-6">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold">Enter Meter and Amount</h3>
          <p className="text-sm text-muted-foreground">
            Enter the meter number and desired amount to continue.
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
          {error && (
            <div className="flex items-center space-x-2 rounded-md bg-red-500/10 p-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
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
                <p className="font-semibold">{confirmationDetails.consumer.name}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Home className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-semibold">{confirmationDetails.consumer.address}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="mt-1 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utility</p>
                <p className="font-semibold">{confirmationDetails.utility}</p>
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
        <Button onClick={handleVendPayment} disabled={isLoading} className="w-full">
          {isLoading ? 'Processing Payment...' : `Pay R ${amount}`}
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
