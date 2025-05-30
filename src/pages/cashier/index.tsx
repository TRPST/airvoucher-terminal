import * as React from "react";
import { CreditCard, Wallet, Percent, Tags } from "lucide-react";

import { ConfettiOverlay } from "@/components/ConfettiOverlay";
import { StickyBalanceHeader } from "@/components/cashier/StickyBalanceHeader";
import {
  fetchCashierTerminal,
  fetchAvailableVoucherTypes,
  fetchVoucherInventoryByType,
  fetchRetailerCommissionData,
  sellVoucher,
  type CashierTerminalProfile,
  type VoucherType,
} from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

// Import custom components
import { VoucherCategoriesGrid } from "@/components/retailer/VoucherCategoriesGrid";
import { VoucherValuesGrid } from "@/components/retailer/VoucherValuesGrid";
import { ConfirmSaleDialog } from "@/components/retailer/ConfirmSaleDialog";
import { SuccessToast } from "@/components/retailer/SuccessToast";
import { SaleReceiptDialog } from "@/components/dialogs/SaleReceiptDialog";
import { useTerminal } from "@/contexts/TerminalContext";

export default function CashierPOS() {
  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole("cashier");

  // Get the current user ID
  const userId = user?.id;

  // State for terminal/cashier data and loading/error states
  const [terminal, setTerminal] = React.useState<CashierTerminalProfile | null>(null);
  const [voucherTypeNames, setVoucherTypeNames] = React.useState<string[]>([]);
  const [voucherInventory, setVoucherInventory] = React.useState<VoucherType[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isVoucherInventoryLoading, setIsVoucherInventoryLoading] = React.useState(false);
  const [dataError, setDataError] = React.useState<string | null>(null);

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
  const [saleInfo, setSaleInfo] = React.useState<{
    pin: string;
    serial_number?: string;
  } | null>(null);
  const [receiptData, setReceiptData] = React.useState<any>(null);
  const [commissionData, setCommissionData] = React.useState<{
    rate: number;
    amount: number;
    groupName: string;
  } | null>(null);
  const [commissionError, setCommissionError] = React.useState<string | null>(null);
  const { setTerminalInfo } = useTerminal();

  // Set the terminal and retailer name in the context and document title
  React.useEffect(() => {
    if (terminal) {
      // Update the context with terminal info
      setTerminalInfo(terminal.terminal_name, terminal.retailer_name);
      // Update the page title to include terminal info
      document.title = `${terminal.terminal_name} • ${terminal.retailer_name} - AirVoucher`;
    }
  }, [terminal, setTerminalInfo]);

  // Fetch terminal data and voucher types on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch cashier's terminal profile
        const { data: terminalData, error: terminalError } = await fetchCashierTerminal(userId);

        if (terminalError) {
          setDataError(`Failed to load terminal profile: ${terminalError.message}`);
          return;
        }

        if (!terminalData) {
          setDataError("No terminal profile found for this cashier");
          return;
        }

        setTerminal(terminalData);

        // Fetch available voucher type names
        const { data: voucherNames, error: voucherError } = await fetchAvailableVoucherTypes();

        if (voucherError) {
          setDataError(`Failed to load voucher types: ${voucherError.message}`);
          return;
        }
        
        setVoucherTypeNames(voucherNames || []);
      } catch (err) {
        setDataError(
          `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized]);

  // Group voucher types by category
  const voucherCategories = React.useMemo(() => {
    if (!voucherTypeNames || voucherTypeNames.length === 0) {
      return [];
    }

    // Categorize voucher types into Mobile Networks and Other Services
    const mobileNetworks = voucherTypeNames
      .filter(name => 
        ['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
          network => name && name.includes(network)
        )
      )
      .map(name => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = "bg-primary/5 hover:bg-primary/10";
        
        if (name?.includes('Vodacom')) {
          color = "bg-primary/5 hover:bg-primary/10";
        } else if (name?.includes('MTN')) {
          color = "bg-yellow-500/5 hover:bg-yellow-500/10";
        } else if (name?.includes('CellC')) {
          color = "bg-indigo-500/5 hover:bg-indigo-500/10";
        } else if (name?.includes('Telkom')) {
          color = "bg-teal-500/5 hover:bg-teal-500/10";
        }
        
        return {
          name: name?.split(' ')[0] || name,
          icon,
          color
        };
      });
    
    const otherServices = voucherTypeNames
      .filter(name => 
        !['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
          network => name && name.includes(network)
        )
      )
      .map((name, index) => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = "bg-primary/5 hover:bg-primary/10";
        
        const categoryName = name?.split(' ')[0] || name;
        
        // Assign different icons and colors based on name
        switch (categoryName?.toLowerCase()) {
          case "ott":
          case "netflix":
          case "showmax":
            icon = <Tags className="h-6 w-6" />;
            color = "bg-purple-500/5 hover:bg-purple-500/10";
            break;
          case "betting":
          case "hollywoodbets":
          case "betway":
            icon = <Wallet className="h-6 w-6" />;
            color = "bg-green-500/5 hover:bg-green-500/10";
            break;
          case "ringa":
            icon = <Percent className="h-6 w-6" />;
            color = "bg-amber-500/5 hover:bg-amber-500/10";
            break;
          case "easyload":
            icon = <CreditCard className="h-6 w-6" />;
            color = "bg-green-500/5 hover:bg-green-500/10";
            break;
          default:
            const colors = [
              "bg-amber-500/5 hover:bg-amber-500/10",
              "bg-pink-500/5 hover:bg-pink-500/10",
              "bg-teal-500/5 hover:bg-teal-500/10",
              "bg-indigo-500/5 hover:bg-indigo-500/10",
              "bg-red-500/5 hover:bg-red-500/10",
            ];
            color = colors[index % colors.length];
            break;
        }
        
        return {
          name: categoryName,
          icon,
          color
        };
      });
    
    const categories = [];
    
    if (mobileNetworks.length > 0) {
      categories.push({
        name: 'Mobile Networks',
        items: mobileNetworks
      });
    }
    
    if (otherServices.length > 0) {
      categories.push({
        name: 'Other Services',
        items: otherServices
      });
    }
    
    return categories;
  }, [voucherTypeNames]);

  // Get vouchers for a specific category
  const getVouchersForCategory = React.useCallback((category: string) => {
    if (!voucherInventory || voucherInventory.length === 0) {
      return [];
    }
    
    const matchingVouchers = voucherInventory.filter(
      (voucher) => 
        voucher.name && 
        voucher.name.toLowerCase().includes(category.toLowerCase()) && 
        voucher.count > 0
    );
    
    return matchingVouchers;
  }, [voucherInventory]);

  // Handle category selection
  const handleCategorySelect = React.useCallback(async (category: string) => {
    setSelectedCategory(category);
    setSelectedValue(null);
    setIsVoucherInventoryLoading(true);
    
    try {
      const { data: inventoryData, error } = await fetchVoucherInventoryByType(category);
      
      if (error) {
        console.error(`Error fetching inventory for ${category}:`, error);
        setIsVoucherInventoryLoading(false);
        return;
      }
      
      if (inventoryData && inventoryData.length > 0) {
        setVoucherInventory(inventoryData);
      } else {
        setVoucherInventory([]);
      }
    } catch (err) {
      console.error(`Unexpected error loading voucher inventory for ${category}:`, err);
      setVoucherInventory([]);
    } finally {
      setIsVoucherInventoryLoading(false);
    }
  }, []);

  // Handle voucher value selection
  const handleValueSelect = React.useCallback((value: number) => {
    setSelectedValue(value);
    setCommissionData(null);
    setCommissionError(null);
    setShowConfirmDialog(true);
    
    const selectedVoucher = voucherInventory.find(
      (vt) =>
        vt.name && 
        vt.name.toLowerCase().includes(selectedCategory?.toLowerCase() || '') && 
        vt.amount === value
    );

    if (selectedVoucher && terminal) {
      fetchRetailerCommissionData({
        retailerId: terminal.retailer_id,
        voucherTypeId: selectedVoucher.id,
        voucherValue: value,
      }).then((result) => {
        const { data, error } = result;
        if (data && !error) {
          setCommissionData(data);
        } else {
          setCommissionError(`Error: ${error?.message || 'Failed to get commission data'}`);
        }
      }).catch((err: unknown) => {
        console.error("Error fetching commission data:", err);
        setCommissionError(`Error: ${err instanceof Error ? err.message : 'Failed to get commission data'}`);
      });
    } else {
      setCommissionError('Missing voucher or terminal information');
    }
  }, [selectedCategory, voucherInventory, terminal]);

  // Handle confirm sale
  const handleConfirmSale = React.useCallback(async () => {
    if (!terminal || !selectedValue || !selectedCategory) {
      setSaleError("Missing sale information");
      return;
    }

    const selectedVoucher = voucherInventory.find(
      (vt) =>
        vt.name && 
        vt.name.toLowerCase().includes(selectedCategory.toLowerCase()) && 
        vt.amount === selectedValue
    );

    if (!selectedVoucher) {
      setSaleError("Selected voucher not found");
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
        setSaleError(`Sale failed: ${error.message}`);
        return;
      }

      setShowConfirmDialog(false);

      if (data && data.receipt) {
        setReceiptData(data.receipt);
        setShowReceiptDialog(true);
        setSaleInfo(data.voucher);
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      setSaleComplete(true);
      setShowToast(true);

      // Refresh terminal data
      if (userId) {
        const { data: refreshedTerminal } = await fetchCashierTerminal(userId);
        if (refreshedTerminal) {
          setTerminal(refreshedTerminal);
        }
      }
    } catch (err) {
      setSaleError(
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsSelling(false);
    }
  }, [terminal, selectedValue, selectedCategory, voucherInventory, userId]);

  // Handle receipt dialog close
  const handleReceiptClose = React.useCallback(() => {
    setShowReceiptDialog(false);
    setReceiptData(null);
    setSelectedCategory(null);
    setSelectedValue(null);
    setSaleComplete(false);
    setShowToast(false);
    setSaleInfo(null);
  }, []);

  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{dataError}</p>
        </div>
      </div>
    );
  }

  if (!terminal) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Terminal Not Found</h2>
          <p className="text-muted-foreground">Unable to load terminal information.</p>
        </div>
      </div>
    );
  }

  // Create a retailer-like object for the components that expect it
  const retailerForComponents = {
    id: terminal.retailer_id,
    name: terminal.retailer_name,
    balance: terminal.retailer_balance,
    credit_limit: terminal.retailer_credit_limit,
    credit_used: terminal.retailer_credit_used,
    commission_balance: terminal.retailer_commission_balance,
    status: "active" as const,
    user_profile_id: "",
  };

  return (
    <div className="flex flex-col">
      {/* Sticky Balance Header */}
      <StickyBalanceHeader
        balance={terminal.retailer_balance}
        creditLimit={terminal.retailer_credit_limit}
        creditUsed={terminal.retailer_credit_used}
        commissionBalance={terminal.retailer_commission_balance}
      />

      {/* Main Content */}
      <div className="space-y-6 p-4">
        {/* Confetti effect on successful sale */}
        {showConfetti && <ConfettiOverlay />}


        {/* Voucher Categories Grid or Voucher Values Grid */}
        {!selectedCategory ? (
          <VoucherCategoriesGrid 
            categories={voucherCategories}
            onCategorySelect={handleCategorySelect}
          />
        ) : (
          <VoucherValuesGrid
            selectedCategory={selectedCategory}
            isLoading={isVoucherInventoryLoading}
            vouchers={getVouchersForCategory(selectedCategory)}
            onValueSelect={handleValueSelect}
            onBackToCategories={() => setSelectedCategory(null)}
          />
        )}

        {/* Confirm Sale Dialog */}
        <ConfirmSaleDialog
          showDialog={showConfirmDialog}
          selectedCategory={selectedCategory}
          selectedValue={selectedValue}
          retailer={retailerForComponents}
          commissionData={commissionData}
          commissionError={commissionError}
          onCancel={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSale}
          isSelling={isSelling}
          saleError={saleError}
        />

        {/* Success Toast */}
        <SuccessToast
          show={showToast}
          category={selectedCategory}
          value={selectedValue}
        />

        {/* Receipt Dialog */}
        <SaleReceiptDialog
          showDialog={showReceiptDialog}
          onClose={handleReceiptClose}
          receipt={receiptData}
        />
      </div>
    </div>
  );
}
