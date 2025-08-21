import * as React from 'react';
import { CreditCard } from 'lucide-react';
import { useRouter } from 'next/router';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useTerminalData } from '@/hooks/useTerminalData';
import { useVoucherCategories } from '@/components/terminal/VoucherCategoriesProcessor';

// Import components
import { POSGrid } from '@/components/terminal/POSGrid';
import { POSValuesGrid } from '@/components/terminal/POSValuesGrid';
import { AdminOptionsGrid } from '@/components/terminal/AdminOptionsGrid';
import { BillPaymentsGrid } from '@/components/terminal/BillPaymentsGrid';
import { SalesHistoryScreen } from '@/components/terminal/SalesHistoryScreen';
import { AccountBalanceScreen } from '@/components/terminal/AccountBalanceScreen';
import { ConfirmSaleDialog } from '@/components/terminal/ConfirmSaleDialog';
import { SuccessToast } from '@/components/terminal/SuccessToast';
import { SaleReceiptDialog } from '@/components/dialogs/SaleReceiptDialog';
import { ElectricityBillPayment } from '@/components/terminal/ElectricityBillPayment';
import { DStvBillPayment } from '@/components/terminal/DStvBillPayment';
import { useVoucherInventory } from '@/hooks/useVoucherInventory';
import { useSaleManager } from '@/hooks/useSaleManager';
import { fetchRetailerCommissionData } from '@/actions';
import { useAdminOptions } from '@/hooks/useAdminOptions';

export default function TerminalPOS() {
  const router = useRouter();

  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Get the current user ID
  const userId = user?.id;

  // Terminal and voucher data
  const {
    terminal,
    setTerminal,
    voucherTypeNames,
    isDataLoading,
    dataError,
    commissionData,
    commissionError,
  } = useTerminalData(userId, isAuthorized);

  // Voucher inventory management
  const {
    voucherInventory,
    isVoucherInventoryLoading,
    fetchVoucherInventory,
    getVouchersForCategory,
    findVoucher,
  } = useVoucherInventory();

  // Sale management
  const saleManager = useSaleManager(terminal, setTerminal);
  const {
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
    setShowConfirmDialog,
    setSelectedCategory,
    handleValueSelect,
    handleConfirmSale,
    handleCloseReceipt,
    clearSaleError,
  } = saleManager;

  // Admin and bill payments options
  const adminOptions = useAdminOptions();
  const {
    showAdminOptions,
    selectedAdminOption,
    showBillPayments,
    handleAdminOptionSelect,
    handleBillPaymentOptionSelect: adminHandleBillPaymentOptionSelect,
    handleBackToAdmin,
    handleBackToCategories: adminHandleBackToCategories,
  } = adminOptions;

  // Bill payment states
  const [showElectricityPayment, setShowElectricityPayment] = React.useState(false);
  const [showDStvPayment, setShowDStvPayment] = React.useState(false);

  // Local receipt modal for bill payments (e.g., Electricity via RPC)
  const [billReceiptData, setBillReceiptData] = React.useState<any | null>(null);
  const [showBillReceipt, setShowBillReceipt] = React.useState(false);

  // Wrapper function to handle back to categories
  const handleBackToCategories = React.useCallback(() => {
    adminHandleBackToCategories();
    setSelectedCategory(null);
    setShowElectricityPayment(false);
    setShowDStvPayment(false);
  }, [adminHandleBackToCategories, setSelectedCategory]);

  // Process voucher categories
  const voucherCategories = useVoucherCategories(voucherTypeNames);

  // Handle bill payment option selection
  const handleBillPaymentOptionSelect = React.useCallback(
    async (option: string) => {
      adminHandleBillPaymentOptionSelect(option);

      if (option === 'Electricity') {
        setShowElectricityPayment(true);
        adminOptions.setShowBillPayments(false);
      } else if (option === 'DSTV') {
        setShowDStvPayment(true);
        adminOptions.setShowBillPayments(false);
      }
    },
    [adminHandleBillPaymentOptionSelect, adminOptions]
  );

  // Handle category selection
  const handleCategorySelect = React.useCallback(
    (category: string) => {
      if (category === 'Admin') {
        router.push('/terminal/admin');
      } else if (category === 'Bill Payments') {
        adminOptions.handleCategorySelect(category);
      } else if (category === 'Electricity') {
        setShowElectricityPayment(true);
        adminOptions.setShowAdminOptions(false);
        adminOptions.setShowBillPayments(false);
      } else if (category === 'DSTV') {
        setShowDStvPayment(true);
        adminOptions.setShowAdminOptions(false);
        adminOptions.setShowBillPayments(false);
      } else {
        // Navigate to category-specific voucher values page for other services
        router.push(`/terminal/category/${encodeURIComponent(category.toLowerCase())}`);
      }
    },
    [router]
  );

  // Handle value selection with commission fetch
  const handleValueSelectWithCommission = React.useCallback(
    async (value: number) => {
      if (!selectedCategory || !terminal) return;

      handleValueSelect(value);

      // Fetch commission data for selected voucher
      try {
        const selectedVoucher = findVoucher(selectedCategory, value);

        if (selectedVoucher) {
          await fetchRetailerCommissionData({
            retailerId: terminal.retailer_id,
            voucherTypeId: selectedVoucher.id,
            voucherValue: value,
          });
        }
      } catch (error) {
        console.error('Failed to fetch commission data:', error);
      }
    },
    [selectedCategory, terminal, handleValueSelect, findVoucher]
  );

  // Handle confirm sale with voucher lookup
  const handleConfirmSaleWithVoucher = React.useCallback(() => {
    if (!selectedCategory || !selectedValue) return;

    const selectedVoucher = findVoucher(selectedCategory, selectedValue);
    handleConfirmSale(selectedVoucher, commissionData);
  }, [selectedCategory, selectedValue, findVoucher, handleConfirmSale, commissionData]);

  // Handle electricity payment completion (show receipt dialog)
  const handleElectricityPaymentComplete = React.useCallback((paymentData: any) => {
    // paymentData is expected to be the RPC receipt
    setBillReceiptData(paymentData);
    setShowBillReceipt(true);
  }, []);

  // Handle DStv payment completion
  const handleDStvPaymentComplete = React.useCallback((paymentData: any) => {
    console.log('DStv payment completed:', paymentData);
  }, []);
    
  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1">
        {isDataLoading ? (
          <div className="flex h-96 flex-col items-center justify-center">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg font-medium">Loading Cashier Terminal...</p>
          </div>
        ) : dataError ? (
          <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
              <CreditCard className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Terminal Error</h2>
            <p className="mb-4 text-muted-foreground">{dataError}</p>
          </div>
        ) : showElectricityPayment ? (
          <ElectricityBillPayment
            onPaymentComplete={handleElectricityPaymentComplete}
            onBackToCategories={handleBackToCategories}
            terminal={terminal}
            setTerminal={setTerminal}
          />
        ) : showDStvPayment ? (
          <DStvBillPayment
            onPaymentComplete={handleDStvPaymentComplete}
            onBackToCategories={handleBackToCategories}
            terminal={terminal}
            setTerminal={setTerminal}
          />
        ) : showAdminOptions && selectedAdminOption === 'Account Balance' && terminal ? (
          <AccountBalanceScreen
            retailerName={terminal.retailer_name}
            terminalName={terminal.terminal_name}
            retailerBalance={terminal.retailer_balance}
            retailerCreditLimit={terminal.retailer_credit_limit}
            retailerCreditUsed={terminal.retailer_credit_used}
            terminalCommission={terminal.retailer_commission_balance}
            onBackToAdmin={handleBackToAdmin}
          />
        ) : showAdminOptions && selectedAdminOption === 'Sales History' && terminal ? (
          <SalesHistoryScreen
            terminalId={terminal.terminal_id}
            terminalName={terminal.terminal_name}
            onBackToAdmin={handleBackToAdmin}
          />
        ) : showAdminOptions ? (
          <AdminOptionsGrid
            onOptionSelect={handleAdminOptionSelect}
            onBackToCategories={handleBackToCategories}
          />
        ) : showBillPayments ? (
          <BillPaymentsGrid
            onOptionSelect={handleBillPaymentOptionSelect}
            onBackToCategories={handleBackToCategories}
          />
        ) : selectedCategory ? (
          <POSValuesGrid
            selectedCategory={selectedCategory}
            isLoading={isVoucherInventoryLoading}
            vouchers={getVouchersForCategory(selectedCategory)}
            onValueSelect={handleValueSelectWithCommission}
            onBackToCategories={handleBackToCategories}
          />

        ) : (
          <POSGrid categories={voucherCategories} onCategorySelect={handleCategorySelect} />
        )}
      </main>

      {/* Dialogs and Feedback */}
      {showConfirmDialog && selectedCategory && selectedValue && (
        <ConfirmSaleDialog
          voucherType={selectedCategory || ''}
          amount={selectedValue || 0}
          commissionRate={commissionData?.rate || 0}
          commissionAmount={commissionData?.amount || 0}
          isOverride={commissionData?.isOverride || false}
          isLoading={isSelling}
          error={saleError || commissionError}
          onConfirm={handleConfirmSaleWithVoucher}
          onCancel={() => setShowConfirmDialog(false)}
          onClearError={clearSaleError}
        />
      )}

      {saleComplete && saleInfo && (
        <SuccessToast
          show={showToast}
          onClose={() => saleManager.setShowToast(false)}
          onViewReceipt={() => saleManager.setShowReceiptDialog(true)}
          voucherType={selectedCategory || ''}
          amount={selectedValue || 0}
          pin={saleInfo.pin}
        />
      )}

      {showReceiptDialog && receiptData && (
        <SaleReceiptDialog
          receiptData={receiptData}
          onClose={handleCloseReceipt}
          terminalName={terminal?.terminal_name || ''}
          retailerName={terminal?.retailer_name || ''}
        />
      )}

      {showBillReceipt && billReceiptData && (
        <SaleReceiptDialog
          receiptData={billReceiptData}
          onClose={() => {
            setShowBillReceipt(false);
            setBillReceiptData(null);
          }}
          terminalName={terminal?.terminal_name || ''}
          retailerName={terminal?.retailer_name || ''}
        />
      )}

      {showConfetti && <ConfettiOverlay />}
    </>
  );
}
