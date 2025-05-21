import * as React from "react";
import { Wallet, CreditCard, Percent, Tags, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";

import { StatsTile } from "@/components/ui/stats-tile";
import { ConfettiOverlay } from "@/components/ConfettiOverlay";
import TerminalSelector from "@/components/TerminalSelector";
import {
  fetchMyRetailer,
  fetchAvailableVoucherTypes,
  fetchVoucherInventoryByType,
  sellVoucher,
  type RetailerProfile,
  type VoucherType,
} from "@/actions";
import { cn } from "@/utils/cn";
import useRequireRole from "@/hooks/useRequireRole";

type VoucherCategoryProps = {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
};

const VoucherCategory = ({
  name,
  icon,
  color,
  onClick,
}: VoucherCategoryProps) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-border p-4 text-center shadow-sm transition-colors",
      "sm:p-6",
      "hover:border-primary/20 hover:shadow-md",
      color
    )}
  >
    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <span className="font-medium">{name}</span>
  </motion.button>
);

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

  // Sale process state
  const [isSelling, setIsSelling] = React.useState(false);
  const [saleError, setSaleError] = React.useState<string | null>(null);
  const [saleInfo, setSaleInfo] = React.useState<{
    pin: string;
    serial_number?: string;
  } | null>(null);

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
    setShowConfirmDialog(true);
  }, []);

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
      });

      if (error) {
        setSaleError(`Sale failed: ${error.message}`);
        setShowConfirmDialog(false);
        return;
      }

      setShowConfirmDialog(false);

      // Store voucher info for display
      if (data) {
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

      // Reset after a delay
      setTimeout(() => {
        setSelectedCategory(null);
        setSelectedValue(null);
        setSaleComplete(false);
        setShowToast(false);
        setSaleInfo(null);
      }, 4000);
    } catch (err) {
      setSaleError(
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsSelling(false);
    }
  }, [activeTerminalId, selectedValue, selectedCategory, voucherInventory, userId]);

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="Available Balance"
          value={`R ${retailer.balance.toFixed(2)}`}
          icon={Wallet}
          intent="success"
          subtitle="Current account balance"
        />
        <StatsTile
          label="Credit Used"
          value={`R ${retailer.credit_used.toFixed(2)}`}
          icon={CreditCard}
          intent="warning"
          subtitle="Active credit amount"
        />
        <StatsTile
          label="Commission Earned"
          value={`R ${retailer.commission_balance.toFixed(2)}`}
          icon={Percent}
          intent="info"
          subtitle="Total earned to date"
        />
      </div>

      {/* Voucher Categories Grid */}
      {!selectedCategory ? (
        <div>
          <h2 className="mb-4 text-lg font-medium">Select Voucher Type</h2>
          {voucherCategories.map((categoryGroup) => (
            <div key={categoryGroup.name} className="mb-6">
              <h3 className="mb-3 text-md font-medium text-muted-foreground">{categoryGroup.name}</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {categoryGroup.items.map((category) => (
                  <VoucherCategory
                    key={category.name}
                    name={category.name}
                    icon={category.icon}
                    color={category.color}
                    onClick={() => handleCategorySelect(category.name)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Voucher Values Grid
        <div>
          <div className="mb-4 space-y-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors group"
            >
              <ChevronLeft className="mr-2 h-5 w-5 transition-transform duration-200 transform group-hover:-translate-x-1" />
              Back to Categories
            </button>
            <h2 className="text-lg font-medium">
              Select {selectedCategory} Voucher Value
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {isVoucherInventoryLoading ? (
              <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <h3 className="text-lg font-medium">Loading Vouchers</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch available {selectedCategory} vouchers.
                </p>
              </div>
            ) : getVouchersForCategory(selectedCategory).length > 0 ? (
              getVouchersForCategory(selectedCategory).map((voucher) => (
                <motion.button
                  key={`${voucher.id}-${voucher.amount}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleValueSelect(voucher.amount)}
                  className="flex flex-col items-center justify-center rounded-lg border border-border p-6 text-center shadow-sm hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-2 text-sm text-muted-foreground">
                    {voucher.name}
                  </div>
                  <div className="text-2xl font-bold">
                    R {voucher.amount.toFixed(2)}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
                <CreditCard className="mb-2 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Vouchers Available</h3>
                <p className="text-sm text-muted-foreground">
                  There are no {selectedCategory} vouchers available at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Sale Dialog */}
      {showConfirmDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <h2 className="mb-1 text-xl font-semibold">Confirm Sale</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                You're about to sell the following voucher:
              </p>

              <div className="mb-6 w-full rounded-lg bg-muted p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedCategory}</span>
                </div>
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="font-medium">
                    R {selectedValue?.toFixed(2)}
                  </span>
                </div>
                {/* Show voucher name if available */}
                {selectedCategory &&
                  getVouchersForCategory(selectedCategory).length > 0 && (
                    <div className="flex justify-between border-t border-border py-2">
                      <span className="text-sm text-muted-foreground">
                        Voucher:
                      </span>
                      <span className="font-medium">
                        {selectedCategory &&
                          getVouchersForCategory(selectedCategory)[0]?.name}
                      </span>
                    </div>
                  )}
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Commission:
                  </span>
                  <span className="font-medium text-green-500">
                    R {((selectedValue || 0) * 0.02).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSale}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in-20 max-w-md rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-500 shadow-lg">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-5 w-5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <h4 className="font-medium">Sale Successful!</h4>
              <p className="text-sm">
                {selectedCategory} voucher for R {selectedValue?.toFixed(2)}{" "}
                sold successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
