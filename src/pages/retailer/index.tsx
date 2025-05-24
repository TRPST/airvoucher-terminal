import * as React from "react";
import { CreditCard, Wallet, Percent, Tags, ChevronLeft } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { motion } from "framer-motion";

import { ConfettiOverlay } from "@/components/ConfettiOverlay";
import TerminalSelector from "@/components/TerminalSelector";
import { StatsTile } from "@/components/ui/stats-tile";
import {
  fetchMyRetailer,
  fetchAvailableVoucherTypes,
  fetchVoucherInventoryByType,
  fetchRetailerCommissionData,
  sellVoucher,
  type RetailerProfile,
  type VoucherType,
} from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

// Import custom components
import { RetailerStats } from "@/components/retailer/RetailerStats";
import { VoucherCategoriesGrid } from "@/components/retailer/VoucherCategoriesGrid";
import { VoucherValuesGrid } from "@/components/retailer/VoucherValuesGrid";
import { ConfirmSaleDialog } from "@/components/retailer/ConfirmSaleDialog";
import { SuccessToast } from "@/components/retailer/SuccessToast";
import { SaleReceiptDialog } from "@/components/dialogs/SaleReceiptDialog";


export default function RetailerPOS() {
  // Protect this route - only allow retailer role
  const { isLoading } = useRequireRole("retailer");

  // Get the current user from Supabase Auth
  const session = useSession();
  const userId = session?.user?.id;

  // State for retailer data and loading/error states
  const [retailer, setRetailer] = React.useState<RetailerProfile | null>(null);
  const [voucherTypeNames, setVoucherTypeNames] = React.useState<string[]>([]);
  const [voucherInventory, setVoucherInventory] = React.useState<VoucherType[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isVoucherInventoryLoading, setIsVoucherInventoryLoading] = React.useState(false);
  const [dataError, setDataError] = React.useState<string | null>(null);
  const [activeTerminalId, setActiveTerminalId] = React.useState<string | null>(
    null
  );

  // Sale UI state
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );
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

  // Fetch retailer data and voucher types on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch retailer profile
        const { data: retailerData, error: retailerError } =
          await fetchMyRetailer(userId);

        if (retailerError) {
          setDataError(
            `Failed to load retailer profile: ${retailerError.message}`
          );
          return;
        }

        if (!retailerData) {
          setDataError("No retailer profile found for this user");
          return;
        }

        setRetailer(retailerData);

        // Fetch available voucher type names
        const { data: voucherNames, error: voucherError } =
          await fetchAvailableVoucherTypes();

        if (voucherError) {
          setDataError(`Failed to load voucher types: ${voucherError.message}`);
          return;
        }
        console.log('voucherNames', voucherNames);
        setVoucherTypeNames(voucherNames || []);
      } catch (err) {
        setDataError(
          `Unexpected error: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Group voucher types by category
  const voucherCategories = React.useMemo(() => {
    // Check if voucherTypeNames is empty or undefined
    if (!voucherTypeNames || voucherTypeNames.length === 0) {
      // Return default categories if no voucher types are available
      return [
        {
          name: "Mobile Networks",
          items: [
            {
              name: "Vodacom",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-blue-500/5 hover:bg-blue-500/10",
            },
            {
              name: "MTN",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-yellow-500/5 hover:bg-yellow-500/10",
            },
            {
              name: "Telkom",
              icon: <CreditCard className="h-6 w-6" />,
              color: "bg-blue-500/5 hover:bg-blue-500/10",
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

    // Categorize voucher types into Mobile Networks and Other Services
    const mobileNetworks = voucherTypeNames
      .filter(name => 
        ['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
          network => name && name.includes(network)
        )
      )
      .map(name => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = "bg-blue-500/5 hover:bg-blue-500/10";
        
        // Assign different colors based on network
        if (name?.includes('Vodacom')) {
          color = "bg-blue-500/5 hover:bg-blue-500/10";
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
    
    // Other services (those not in mobile networks)
    const otherServices = voucherTypeNames
      .filter(name => 
        !['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
          network => name && name.includes(network)
        )
      )
      .map((name, index) => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = "bg-blue-500/5 hover:bg-blue-500/10";
        
        // Get the first word of the name as the category
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
            // Use index for others to get a nice variety
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
    
    // Create category groups
    const categories = [];
    
    // Add mobile networks category if there are any
    if (mobileNetworks.length > 0) {
      categories.push({
        name: 'Mobile Networks',
        items: mobileNetworks
      });
    }
    
    // Add others as a category
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
    // If no voucher inventory is available, return empty array
    if (!voucherInventory || voucherInventory.length === 0) {
      return [];
    }
    
    // Filter vouchers that match the category and have available inventory
    const matchingVouchers = voucherInventory.filter(
      (voucher) => 
        voucher.name && 
        voucher.name.toLowerCase().includes(category.toLowerCase()) && 
        voucher.count > 0
    );
    
    //console.log(`Found ${matchingVouchers.length} matching vouchers for ${category}:`, 
     matchingVouchers.map(v => `${v.name} R${v.amount}`);
    
    return matchingVouchers;
  }, [voucherInventory]);

  // Terminal selection handler
  const handleTerminalSelect = React.useCallback((terminalId: string) => {
    setActiveTerminalId(terminalId);
  }, []);

  // Handle category selection
  const handleCategorySelect = React.useCallback(async (category: string) => {
    setSelectedCategory(category);
    setSelectedValue(null);
    setIsVoucherInventoryLoading(true);
    
    // Fetch voucher inventory for this category
    try {
      console.log(`Fetching inventory for category: ${category}`);
      const { data: inventoryData, error } = await fetchVoucherInventoryByType(category);
      
      if (error) {
        console.error(`Error fetching inventory for ${category}:`, error);
        setIsVoucherInventoryLoading(false);
        return;
      }
      
      if (inventoryData && inventoryData.length > 0) {
        console.log(`Loaded ${inventoryData.length} voucher options for ${category}:`, 
          inventoryData.map(v => `${v.name} R${v.amount} (${v.count})`));
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
    setCommissionData(null); // Reset commission data
    setCommissionError(null); // Reset commission error
    setShowConfirmDialog(true);
    
    // Get the voucher type ID for the selected category and value
    const selectedVoucher = voucherInventory.find(
      (vt) =>
        vt.name && 
        vt.name.toLowerCase().includes(selectedCategory?.toLowerCase() || '') && 
        vt.amount === value
    );

    if (selectedVoucher && retailer) {
      // Use the new fetchRetailerCommissionData function instead of manual calculations
      fetchRetailerCommissionData({
        retailerId: retailer.id,
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
      // If we don't have enough info to fetch the rate
      setCommissionError('Missing voucher or retailer information');
    }
  }, [selectedCategory, voucherInventory, retailer]);

  // Effect to prevent body scrolling when modal is open
  React.useEffect(() => {
    if (showConfirmDialog) {
      // Disable scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showConfirmDialog]);

  // Handle sale confirmation
  const handleConfirmSale = React.useCallback(async () => {
    if (!activeTerminalId || !selectedValue || !selectedCategory) {
      setSaleError("Missing required information for sale");
      return;
    }

    // Get the voucher type ID for the selected category and value
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
        terminalId: activeTerminalId,
        voucherTypeId: selectedVoucher.id,
        amount: selectedValue,
      });

      if (error) {
        setSaleError(`Sale failed: ${error.message}`);
        return;
      }

      setShowConfirmDialog(false);

      // Store receipt data for display
      if (data && data.receipt) {
        setReceiptData(data.receipt);
        
        // Show receipt dialog
        setShowReceiptDialog(true);
        
        // Store voucher info for backup display
        setSaleInfo(data.voucher);
      }

      // Show confetti and toast for visual feedback
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      setSaleComplete(true);
      setShowToast(true);

      // Refresh retailer data to show updated balance
      if (userId) {
        const { data: refreshedRetailer } = await fetchMyRetailer(userId);
        if (refreshedRetailer) {
          setRetailer(refreshedRetailer);
        }
      }
    } catch (err) {
      setSaleError(
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsSelling(false);
    }
  }, [activeTerminalId, selectedValue, selectedCategory, voucherInventory, userId]);

  // Handle receipt dialog close
  const handleReceiptClose = React.useCallback(() => {
    setShowReceiptDialog(false);
    
    // Reset sale state
    setReceiptData(null);
    setSelectedCategory(null);
    setSelectedValue(null);
    setSaleComplete(false);
    setShowToast(false);
    setSaleInfo(null);
  }, []);

  // Show loading state while checking authentication or loading data
  if (isLoading || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state if any
  if (dataError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
          <CreditCard className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Error Loading Data</h2>
        <p className="max-w-md text-muted-foreground">{dataError}</p>
      </div>
    );
  }

  // If retailer data hasn't loaded or there's no active terminal, show appropriate message
  if (!retailer) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-amber-500/10 p-3 text-amber-500">
          <Wallet className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Account Not Found</h2>
        <p className="max-w-md text-muted-foreground">
          We couldn't find your retailer account. Please contact support for
          assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confetti effect on successful sale */}
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div className="relative">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Sell Vouchers
          </h1>
          <p className="text-muted-foreground">
            Select a voucher category and value to make a sale.
          </p>
        </div>
        <div className="absolute top-0 right-0">
          <TerminalSelector
            retailerId={retailer.id}
            onSelect={handleTerminalSelect}
          />
        </div>
      </div>

      {/* Balance Stats */}
      <RetailerStats retailer={retailer} />

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

      {/* Sale Receipt Dialog */}
      <SaleReceiptDialog
        showDialog={showReceiptDialog}
        onClose={handleReceiptClose}
        receipt={receiptData}
      />
    </div>
  );
}
