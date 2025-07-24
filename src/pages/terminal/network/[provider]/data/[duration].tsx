import * as React from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';
import { fetchRetailerCommissionData } from '@/actions';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useTerminalData } from '@/hooks/useTerminalData';
import { useNetworkVoucherInventory } from '@/hooks/useNetworkVoucherInventory';
import { useSale } from '@/contexts/SaleContext';
import { useSaleManager } from '@/hooks/useSaleManager';

// Import components
import { POSValuesGrid } from '@/components/terminal/POSValuesGrid';
import { ConfirmSaleDialog } from '@/components/terminal/ConfirmSaleDialog';
import { SuccessToast } from '@/components/terminal/SuccessToast';
import { SaleReceiptDialog } from '@/components/dialogs/SaleReceiptDialog';

export default function NetworkDataDurationPage() {
  const router = useRouter();
  const { provider, duration } = router.query;

  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Get the current user ID
  const userId = user?.id;

  // Terminal and voucher data
  const { terminal, setTerminal, commissionData, commissionError } = useTerminalData(
    userId,
    isAuthorized
  );

  // Convert provider and duration back to proper case
  const providerName = React.useMemo(() => {
    if (!provider || typeof provider !== 'string') return '';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider]);

  const durationName = React.useMemo(() => {
    if (!duration || typeof duration !== 'string') return '';
    return duration.charAt(0).toUpperCase() + duration.slice(1);
  }, [duration]);

  // Network-specific voucher inventory management
  const {
    voucherInventory,
    isVoucherInventoryLoading,
    fetchNetworkVoucherInventory,
    getVouchersForNetworkCategory,
    findNetworkVoucher,
  } = useNetworkVoucherInventory();

  // Real sale manager with actual sale logic
  const saleManager = useSaleManager(terminal, setTerminal);

  // Sale management from context (for UI state coordination)
  const {
    selectedCategory,
    selectedValue,
    setSelectedCategory,
    setCommissionData,
    initiateSale,
    resetSale,
  } = useSale();

  // Use real sale manager state for UI
  const {
    showConfirmDialog,
    showToast,
    showReceiptDialog,
    showConfetti,
    isSelling,
    saleComplete,
    saleError,
    saleInfo,
    receiptData,
    selectedCategory: saleManagerSelectedCategory,
    selectedValue: saleManagerSelectedValue,
    setShowConfirmDialog,
    setShowToast,
    setShowReceiptDialog,
    handleValueSelect: realHandleValueSelect,
    handleConfirmSale: realHandleConfirmSale,
    handleCloseReceipt,
    setSelectedCategory: setSaleManagerCategory,
    setSelectedValue: setSaleManagerValue,
  } = saleManager;

  // Set selected category when component mounts
  React.useEffect(() => {
    const categoryName = `${providerName} ${durationName} Data`;
    if (providerName && durationName && categoryName !== selectedCategory) {
      setSelectedCategory(categoryName);
      setSaleManagerCategory(categoryName);
    }
  }, [providerName, durationName, selectedCategory, setSelectedCategory, setSaleManagerCategory]);

  // Fetch voucher inventory for this network, category, and subcategory
  React.useEffect(() => {
    if (
      provider &&
      typeof provider === 'string' &&
      duration &&
      typeof duration === 'string' &&
      isAuthorized
    ) {
      fetchNetworkVoucherInventory(provider, 'data', duration);
    }
  }, [provider, duration, isAuthorized, fetchNetworkVoucherInventory]);

  // Handle value selection with commission fetch
  const handleValueSelectWithCommission = React.useCallback(
    async (value: number) => {
      if (
        !provider ||
        typeof provider !== 'string' ||
        !duration ||
        typeof duration !== 'string' ||
        !terminal
      )
        return;

      // Use real sale manager's value selection
      realHandleValueSelect(value);

      // Also update context for coordination
      setSaleManagerValue(value);

      // Fetch commission data for selected voucher
      try {
        const selectedVoucher = findNetworkVoucher(provider, 'data', value, duration);
        if (selectedVoucher) {
          const commissionResult = await fetchRetailerCommissionData({
            retailerId: terminal.retailer_id,
            voucherTypeId: selectedVoucher.id,
            voucherValue: value,
          });

          // Transform the commission result to match our context interface
          if (commissionResult.data) {
            setCommissionData({
              rate: commissionResult.data.rate,
              amount: commissionResult.data.amount,
              isOverride: false,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch commission data:', error);
      }
    },
    [
      provider,
      duration,
      terminal,
      findNetworkVoucher,
      realHandleValueSelect,
      setSaleManagerValue,
      setCommissionData,
    ]
  );

  // Handle confirm sale with voucher lookup - using real sale logic
  const handleConfirmSaleWithVoucher = React.useCallback(async () => {
    if (
      !provider ||
      typeof provider !== 'string' ||
      !duration ||
      typeof duration !== 'string' ||
      !saleManagerSelectedValue ||
      !terminal
    )
      return;

    const selectedVoucher = findNetworkVoucher(
      provider,
      'data',
      saleManagerSelectedValue,
      duration
    );

    // Transform commission data to match useSaleManager expectations
    const saleManagerCommissionData = commissionData
      ? {
          rate: commissionData.rate,
          amount: commissionData.amount,
          groupName: '',
          isOverride: commissionData.isOverride,
        }
      : null;

    // Call the real sale confirmation handler
    await realHandleConfirmSale(selectedVoucher, saleManagerCommissionData);
  }, [
    provider,
    duration,
    saleManagerSelectedValue,
    terminal,
    findNetworkVoucher,
    commissionData,
    realHandleConfirmSale,
  ]);

  // Handle back to data subcategories
  const handleBackToDataCategories = React.useCallback(() => {
    router.push(`/terminal/network/${provider}/data`);
  }, [router, provider]);

  if (!provider || typeof provider !== 'string' || !duration || typeof duration !== 'string') {
    return (
      <main className="flex-1">
        <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Invalid Parameters</h2>
          <p className="mb-4 text-muted-foreground">
            Please select a valid network provider and duration.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Custom Header - consistent with other terminal screens */}
      <div className="px-4 py-6">
        <div className="mb-6 flex-col items-center justify-between sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToDataCategories}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h2 className="mt-3 text-xl font-bold">
            {providerName} {durationName} Data Vouchers
          </h2>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {isVoucherInventoryLoading ? (
              <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <h3 className="text-lg font-medium">Loading Vouchers</h3>
              </div>
            ) : getVouchersForNetworkCategory(provider, 'data', duration).length > 0 ? (
              getVouchersForNetworkCategory(provider, 'data', duration).map((voucher) => (
                <motion.button
                  key={`${voucher.id}-${voucher.amount}`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleValueSelectWithCommission(voucher.amount)}
                  className="flex h-32 flex-col items-center justify-center rounded-lg border border-border p-6 text-center shadow-sm hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-2 text-sm text-muted-foreground">{voucher.name}</div>
                  <div className="text-2xl font-bold">R {voucher.amount.toFixed(0)}</div>
                </motion.button>
              ))
            ) : (
              <div className="col-span-full flex h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
                <CreditCard className="mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Vouchers Available</h3>
                <p className="text-sm text-muted-foreground">
                  There are no vouchers available for this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs and Feedback */}
      {showConfirmDialog && saleManagerSelectedCategory && saleManagerSelectedValue && (
        <ConfirmSaleDialog
          voucherType={saleManagerSelectedCategory}
          amount={saleManagerSelectedValue}
          commissionRate={commissionData?.rate || 0}
          commissionAmount={commissionData?.amount || 0}
          isOverride={commissionData?.isOverride || false}
          isLoading={isSelling}
          error={saleError || commissionError}
          onConfirm={handleConfirmSaleWithVoucher}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {saleComplete && saleInfo && (
        <SuccessToast
          show={showToast}
          onClose={() => setShowToast(false)}
          onViewReceipt={() => setShowReceiptDialog(true)}
          voucherType={saleManagerSelectedCategory || ''}
          amount={saleManagerSelectedValue || 0}
          pin={saleInfo.pin}
        />
      )}

      {showReceiptDialog && receiptData && (
        <SaleReceiptDialog
          receiptData={receiptData}
          onClose={handleCloseReceipt}
          terminalName={terminal?.terminal_name || ''}
          retailerName={terminal?.retailer_name || ''}
          retailerId={terminal?.retailer_id}
        />
      )}

      {showConfetti && <ConfettiOverlay />}
    </>
  );
}
