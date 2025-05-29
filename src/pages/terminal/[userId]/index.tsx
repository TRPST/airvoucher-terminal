import * as React from "react";
import { CreditCard, Wallet, Percent, Tags, ChevronLeft, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";

import { ConfettiOverlay } from "@/components/ConfettiOverlay";
import { StatsTile } from "@/components/ui/stats-tile";
import {
  fetchTerminalProfile,
  fetchTerminalVoucherTypes,
  fetchTerminalVoucherInventoryByType,
  fetchTerminalCommissionData,
  sellTerminalVoucher,
  type TerminalProfile,
  type TerminalVoucherType,
} from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

// Import custom components (reuse retailer components since they're generic)
import { VoucherCategoriesGrid } from "@/components/retailer/VoucherCategoriesGrid";
import { VoucherValuesGrid } from "@/components/retailer/VoucherValuesGrid";
import { ConfirmSaleDialog } from "@/components/retailer/ConfirmSaleDialog";
import { SuccessToast } from "@/components/retailer/SuccessToast";
import { SaleReceiptDialog } from "@/components/dialogs/SaleReceiptDialog";

export default function TerminalPOS() {
  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole("terminal");
  const router = useRouter();

  // Get userId from URL parameters
  const userId = router.query.userId as string;

  // State for terminal data and loading/error states
  const [terminal, setTerminal] = React.useState<TerminalProfile | null>(null);
  const [voucherTypeNames, setVoucherTypeNames] = React.useState<string[]>([]);
  const [voucherInventory, setVoucherInventory] = React.useState<TerminalVoucherType[]>([]);
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

  // Fetch terminal data and voucher types on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch terminal profile
        const { data: terminalData, error: terminalError } = await fetchTerminalProfile(userId);

        if (terminalError) {
          setDataError(`Failed to load terminal profile: ${terminalError.message}`);
          return;
        }

        if (!terminalData) {
          setDataError("No terminal profile found");
          return;
        }

        setTerminal(terminalData);

        // Fetch available voucher type names
        const { data: voucherNames, error: voucherError } = await fetchTerminalVoucherTypes();

        if (voucherError) {
          setDataError(`Failed to load voucher types: ${voucherError.message}`);
          return;
        }
        
        console.log('voucherNames', voucherNames);
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

  // Group voucher types by category (reuse logic from retailer)
  const voucherCategories = React.useMemo(() => {
    if (!voucherTypeNames || voucherTypeNames.length === 0) {
      return [
        {
          name: "Mobile Networks",
          items: [
            {
              name: "Vodacom",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-primary/5 hover:bg-primary/10",
            },
            {
              name: "MTN",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-yellow-500/5 hover:bg-yellow-500/10",
            },
            {
              name: "Telkom",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-primary/5 hover:bg-primary/10",
            },
            {
              name: "CellC",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-indigo-500/5 hover:bg-indigo-500/10",
            },
          ],
        },
        {
          name: "Other Services",
          items: [
            {
              name: "OTT",
              icon: <Tags className="h-6 w-6" />,
              color: "bg-purple-500/5 hover:bg-purple-500/10",
            },
            {
              name: "Hollywoodbets",
              icon: <Wallet className="h-6 w-6" />,
              color: "bg-green-500/5 hover:bg-green-500/10",
            },
            {
              name: "Ringa",
              icon: <Percent className="h-6 w-6" />,
              color: "bg-amber-500/5 hover:bg-amber-500/10",
            },
          ],
        },
      ];
    }

    // Categorize voucher types
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
      .map(name => ({
        name,
        icon: <Tags className="h-6 w-6" />,
        color: "bg-purple-500/5 hover:bg-purple-500/10"
      }));

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
      console.log(`Fetching inventory for category: ${category}`);
      const { data: inventoryData, error } = await fetchTerminalVoucherInventoryByType(category);
      
      if (error) {
        console.error(`Error fetching inventory for ${category}:`, error);
        setIsVoucherInventoryLoading(false);
        return;
      }
      
      if (inventoryData && inventoryData.length > 0) {
        console.log(`Loaded ${inventoryData.length} voucher options for ${category}`);
        setVoucherInventory(inventoryData);
      } else {
        console.log(`No voucher inventory found for ${category}`);
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
      fetchTerminalCommissionData({
        retailerId: terminal.retailer_id,
        voucherTypeId: selectedVoucher.id,
        voucherValue: value,
      }).then((result: { data: { rate: number; amount: number; groupName: string } | null; error: any }) => {
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
    if (!userId || !selectedValue || !selectedCategory) {
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
      const { data, error } = await sellTerminalVoucher({
        terminalId: userId,
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
        const { data: refreshedTerminal } = await fetchTerminalProfile(userId);
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
  }, [userId, selectedValue, selectedCategory, voucherInventory]);

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
    name: terminal.retailer_name || 'Unknown Retailer',
    balance: terminal.retailer_balance || 0,
    credit_limit: terminal.retailer_credit_limit || 0,
    credit_used: terminal.retailer_credit_used || 0,
    commission_balance: terminal.retailer_commission_balance || 0,
    status: "active" as const,
    user_profile_id: "", // Not needed for terminal display
  };

  return (
    <div className="space-y-6">
      {/* Confetti effect on successful sale */}
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div className="relative">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Terminal: {terminal.name}
          </h1>
          <p className="text-muted-foreground">
            Select a voucher category and value to make a sale.
          </p>
        </div>
      </div>

      {/* Balance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsTile
          label="Balance"
          value={`R ${terminal.retailer_balance?.toFixed(2) || '0.00'}`}
          icon={Wallet}
        />
        <StatsTile
          label="Credit Limit"
          value={`R ${terminal.retailer_credit_limit?.toFixed(2) || '0.00'}`}
          icon={CreditCard}
        />
        <StatsTile
          label="Credit Used"
          value={`R ${terminal.retailer_credit_used?.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
        />
        <StatsTile
          label="Commission Balance"
          value={`R ${terminal.retailer_commission_balance?.toFixed(2) || '0.00'}`}
          icon={Percent}
        />
      </div>

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
  );
} 