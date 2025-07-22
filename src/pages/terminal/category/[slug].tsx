import * as React from 'react';
import { useRouter } from 'next/router';
import { ConfettiOverlay } from '@/components/ConfettiOverlay';
import { fetchRetailerCommissionData } from '@/actions';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useTerminalData } from '@/hooks/useTerminalData';
import { useVoucherInventory } from '@/hooks/useVoucherInventory';
import { useSale } from '@/contexts/SaleContext';
import { useSaleManager } from '@/hooks/useSaleManager';

// Import components
import { POSValuesGrid } from '@/components/terminal/POSValuesGrid';
import { ConfirmSaleDialog } from '@/components/terminal/ConfirmSaleDialog';
import { SuccessToast } from '@/components/terminal/SuccessToast';
import { SaleReceiptDialog } from '@/components/dialogs/SaleReceiptDialog';

export default function VoucherCategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Get the current user ID
  const userId = user?.id;

  // Terminal and voucher data
  const { terminal, setTerminal, commissionData, commissionError } = useTerminalData(
    userId,
    isAuthorized
  );

  // Voucher inventory management
  const {
    voucherInventory,
    isVoucherInventoryLoading,
    fetchVoucherInventory,
    getVouchersForCategory,
    findVoucher,
  } = useVoucherInventory();

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

  // Convert slug back to category name
  const categoryName = React.useMemo(() => {
    if (!slug || typeof slug !== 'string') return '';
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  }, [slug]);

  // Set selected category when component mounts
  React.useEffect(() => {
    if (categoryName && categoryName !== selectedCategory) {
      setSelectedCategory(categoryName);
      setSaleManagerCategory(categoryName); // Also set in sale manager
    }
  }, [categoryName, selectedCategory, setSelectedCategory, setSaleManagerCategory]);

  // Fetch voucher inventory for this category
  React.useEffect(() => {
    if (categoryName && isAuthorized) {
      fetchVoucherInventory(categoryName);
    }
  }, [categoryName, isAuthorized, fetchVoucherInventory]);

  // Handle value selection with commission fetch
  const handleValueSelectWithCommission = React.useCallback(
    async (value: number) => {
      if (!categoryName || !terminal) return;

      // Use real sale manager's value selection
      realHandleValueSelect(value);

      // Also update context for coordination
      setSaleManagerValue(value);

      // Fetch commission data for selected voucher
      try {
        const selectedVoucher = findVoucher(categoryName, value);
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
              isOverride: false, // Add default value
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch commission data:', error);
      }
    },
    [
      categoryName,
      terminal,
      findVoucher,
      realHandleValueSelect,
      setSaleManagerValue,
      setCommissionData,
    ]
  );

  // Handle confirm sale with voucher lookup - using real sale logic
  const handleConfirmSaleWithVoucher = React.useCallback(async () => {
    if (!categoryName || !saleManagerSelectedValue || !terminal) return;

    const selectedVoucher = findVoucher(categoryName, saleManagerSelectedValue);

    // Transform commission data to match useSaleManager expectations
    const saleManagerCommissionData = commissionData
      ? {
          rate: commissionData.rate,
          amount: commissionData.amount,
          groupName: '', // Add default value if needed
          isOverride: commissionData.isOverride,
        }
      : null;

    // Call the real sale confirmation handler
    await realHandleConfirmSale(selectedVoucher, saleManagerCommissionData);
  }, [
    categoryName,
    saleManagerSelectedValue,
    terminal,
    findVoucher,
    commissionData,
    realHandleConfirmSale,
  ]);

  // Handle back to categories
  const handleBackToCategories = React.useCallback(() => {
    router.push('/terminal');
  }, [router]);

  if (!slug || typeof slug !== 'string') {
    return (
      <main className="flex-1">
        <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Invalid Category</h2>
          <p className="mb-4 text-muted-foreground">Please select a valid voucher category.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1">
        <POSValuesGrid
          selectedCategory={categoryName}
          isLoading={isVoucherInventoryLoading}
          vouchers={getVouchersForCategory(categoryName)}
          onValueSelect={handleValueSelectWithCommission}
          onBackToCategories={handleBackToCategories}
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
