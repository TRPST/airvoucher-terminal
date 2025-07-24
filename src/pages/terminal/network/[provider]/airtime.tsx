import * as React from 'react';
import { useRouter } from 'next/router';
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

export default function NetworkAirtimePage() {
  const router = useRouter();
  const { provider } = router.query;

  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Get the current user ID
  const userId = user?.id;

  // Terminal and voucher data
  const { terminal, setTerminal, commissionData, commissionError } = useTerminalData(
    userId,
    isAuthorized
  );

  // Convert provider back to proper case
  const providerName = React.useMemo(() => {
    if (!provider || typeof provider !== 'string') return '';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider]);

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
    const categoryName = `${providerName} Airtime`;
    if (providerName && categoryName !== selectedCategory) {
      setSelectedCategory(categoryName);
      setSaleManagerCategory(categoryName);
    }
  }, [providerName, selectedCategory, setSelectedCategory, setSaleManagerCategory]);

  // Fetch voucher inventory for this network and category
  React.useEffect(() => {
    if (provider && typeof provider === 'string' && isAuthorized) {
      fetchNetworkVoucherInventory(provider, 'airtime');
    }
  }, [provider, isAuthorized, fetchNetworkVoucherInventory]);

  // Handle value selection with commission fetch
  const handleValueSelectWithCommission = React.useCallback(
    async (value: number) => {
      if (!provider || typeof provider !== 'string' || !terminal) return;

      // Use real sale manager's value selection
      realHandleValueSelect(value);

      // Also update context for coordination
      setSaleManagerValue(value);

      // Fetch commission data for selected voucher
      try {
        const selectedVoucher = findNetworkVoucher(provider, 'airtime', value);
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
      terminal,
      findNetworkVoucher,
      realHandleValueSelect,
      setSaleManagerValue,
      setCommissionData,
    ]
  );

  // Handle confirm sale with voucher lookup - using real sale logic
  const handleConfirmSaleWithVoucher = React.useCallback(async () => {
    if (!provider || typeof provider !== 'string' || !saleManagerSelectedValue || !terminal) return;

    const selectedVoucher = findNetworkVoucher(provider, 'airtime', saleManagerSelectedValue);

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
    saleManagerSelectedValue,
    terminal,
    findNetworkVoucher,
    commissionData,
    realHandleConfirmSale,
  ]);

  // Handle back to network selection
  const handleBackToNetwork = React.useCallback(() => {
    router.push(`/terminal/network/${provider}`);
  }, [router, provider]);

  if (!provider || typeof provider !== 'string') {
    return (
      <main className="flex-1">
        <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Invalid Network Provider</h2>
          <p className="mb-4 text-muted-foreground">Please select a valid network provider.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1">
        <POSValuesGrid
          selectedCategory={`${providerName} Airtime`}
          isLoading={isVoucherInventoryLoading}
          vouchers={getVouchersForNetworkCategory(provider, 'airtime')}
          onValueSelect={handleValueSelectWithCommission}
          onBackToCategories={handleBackToNetwork}
        />
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
