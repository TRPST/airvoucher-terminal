import * as React from "react";
import { CreditCard, Wallet, Percent, Tags, Settings, FileText } from "lucide-react";
import { motion } from "framer-motion";

import { ConfettiOverlay } from "@/components/ConfettiOverlay";
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

// Import new POS-style components
import { TopNavBar } from "@/components/cashier/TopNavBar";
import { POSGrid } from "@/components/cashier/POSGrid";
import { POSValuesGrid } from "@/components/cashier/POSValuesGrid";
import { AdminOptionsGrid } from "@/components/cashier/AdminOptionsGrid";
import { BillPaymentsGrid } from "@/components/cashier/BillPaymentsGrid";
import { QuickActionFooter } from "@/components/cashier/QuickActionFooter";
import { SalesHistoryScreen } from "@/components/cashier/SalesHistoryScreen";
import { AccountBalanceScreen } from "@/components/cashier/AccountBalanceScreen";

// Import existing components
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
  const [isBalanceLoading, setIsBalanceLoading] = React.useState(false);

  // Sale UI state
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [saleComplete, setSaleComplete] = React.useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = React.useState(false);

  // Admin state
  const [showAdminOptions, setShowAdminOptions] = React.useState(false);
  const [selectedAdminOption, setSelectedAdminOption] = React.useState<string | null>(null);

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
  const { setTerminalInfo, setBalanceInfo, setBalanceLoading, updateBalanceAfterSale } = useTerminal();

  // Additional state for total commissions
  const [retailerCommissions, setRetailerCommissions] = React.useState<number>(0);

  // Additional state for terminal commissions
  const [terminalCommissions, setTerminalCommissions] = React.useState<number>(0);

  // Bill Payments state
  const [showBillPayments, setShowBillPayments] = React.useState(false);
  const [selectedBillPayment, setSelectedBillPayment] = React.useState<string | null>(null);

  // Set the terminal and retailer name in the context and document title
  React.useEffect(() => {
    if (terminal) {
      // Update the context with terminal info
      setTerminalInfo(terminal.terminal_name, terminal.retailer_name);
      
      // Update balance info in the context
      const availableCredit = terminal.retailer_credit_limit - terminal.retailer_credit_used;
      setBalanceInfo(terminal.retailer_balance, availableCredit);
      
      // Update the page title to include terminal info
      document.title = `${terminal.terminal_name} • ${terminal.retailer_name} - AirVoucher`;
      
      // For demo purposes - would normally come from an API call
      // Terminal commissions should be less than retailer total commissions
      setTerminalCommissions(parseFloat((Math.random() * 300 + 100).toFixed(2)));
    }
  }, [terminal, setTerminalInfo, setBalanceInfo]);

  // Fetch terminal data and voucher types on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);
      setIsBalanceLoading(true);

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
        setIsBalanceLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized]);

  // Group voucher types by category
  const voucherCategories = React.useMemo(() => {
    if (!voucherTypeNames || voucherTypeNames.length === 0) {
      return [];
    }

    // Debug check - log the voucher type names
    console.log("Voucher Type Names:", voucherTypeNames);

    // Filter out any empty or undefined names
    const validVoucherTypeNames = voucherTypeNames.filter(name => name && name.trim() !== '');

    // Debug - log valid names after filtering
    console.log("Valid Voucher Type Names:", validVoucherTypeNames);

    // Categorize voucher types into Mobile Networks and Other Services
    const mobileNetworks = validVoucherTypeNames
      .filter(name => 
        ['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
          network => name && name.includes(network)
        )
      )
      .map(name => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20";
        
        if (name?.includes('Vodacom')) {
          icon = <img src="/assets/vouchers/vodacom-logo.png" alt="Vodacom" className="w-full h-full object-cover rounded-lg" />;
          color = "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20";
        } else if (name?.includes('MTN')) {
          icon = <img src="/assets/vouchers/mtn-logo.jpg" alt="MTN" className="w-full h-full object-cover rounded-lg" />;
          color = "bg-yellow-500/5 hover:bg-yellow-500/10 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20";
        } else if (name?.includes('CellC')) {
          icon = <img src="/assets/vouchers/cellc-logo.png" alt="Cell C" className="w-full h-full object-cover rounded-lg" />;
          color = "bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20";
        } else if (name?.includes('Telkom')) {
          icon = <img src="/assets/vouchers/telkom-logo.png" alt="Telkom" className="w-full h-full object-cover rounded-lg" />;
          color = "bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-500/10 dark:hover:bg-teal-500/20";
        }
        
        return {
          name: name?.split(' ')[0] || name,
          icon,
          color
        };
      });
    
    // Filter otherServices to exclude any bill payment options, including empty ones
    const otherServices = validVoucherTypeNames
      .filter(name => {
        // Skip mobile networks (already handled)
        if (['Vodacom', 'MTN', 'CellC', 'Telkom'].some(network => name && name.includes(network))) {
          return false;
        }
        
        // Skip bill payment options
        if (['MangaungMunicipality', 'Mukuru', 'Ecocash', 'HelloPaisa', 'DSTV'].some(option => name && name.includes(option))) {
          return false;
        }
        
        // Also skip any empty or null items
        if (!name || name.trim() === '') {
          return false;
        }
        
        return true;
      })
      .map((name, index) => {
        let icon = <CreditCard className="h-6 w-6" />;
        let color = "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20";
        
        const categoryName = name?.split(' ')[0] || name;
        
        // Assign different icons and colors based on name
        switch (categoryName?.toLowerCase()) {
          case "ott":
          case "netflix":
          case "showmax":
            icon = <img src="/assets/vouchers/ott-logo.png" alt="OTT" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-500/10 dark:hover:bg-purple-500/20";
            break;
          case "betting":
          case "hollywoodbets":
          case "betway":
            icon = <img src="/assets/vouchers/hollywoodbets-logo.jpg" alt="Hollywoodbets" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20";
            break;
          case "ringa":
            icon = <img src="/assets/vouchers/ringas-logo.jpg" alt="Ringas" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20";
            break;
          case "easyload":
            icon = <img src="/assets/vouchers/easyload-logo.png" alt="Easyload" className="h-24 w-auto max-w-full object-contain rounded-lg" />;
            color = "bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20";
            break;
          case "dstv":
            icon = <img src="/assets/vouchers/dstv-logo.png" alt="DSTV" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20";
            break;
          case "hellopaisa":
            icon = <img src="/assets/vouchers/hellopaisa-logo.png" alt="Hello Pesa" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20";
            break;
          case "eskom":
            icon = <img src="/assets/vouchers/eskom-logo.jpg" alt="Eskom" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/20";
            break;
          case "unipin":
            icon = <img src="/assets/vouchers/unipin-logo.png" alt="Unipin" className="w-full h-full object-cover rounded-lg" />;
            color = "bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20";
            break;
          default:
            const colors = [
              "bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/10 dark:hover:bg-amber-500/20",
              "bg-pink-500/5 hover:bg-pink-500/10 dark:bg-pink-500/10 dark:hover:bg-pink-500/20",
              "bg-teal-500/5 hover:bg-teal-500/10 dark:bg-teal-500/10 dark:hover:bg-teal-500/20",
              "bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
              "bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/20",
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
    
    console.log("Other Services:", otherServices);
    
    // Replace the sort with a more explicit reordering approach
    const reorderedServices = [...otherServices].filter(
      item => item.name.toLowerCase() !== 'unipin' && item.name.toLowerCase() !== 'eskom'
    );
    
    // Find Unipin and Eskom items
    const unipinItem = otherServices.find(item => item.name.toLowerCase() === 'unipin');
    const eskomItem = otherServices.find(item => item.name.toLowerCase() === 'eskom');
    
    // Add Unipin and Eskom to the end in the correct order
    if (unipinItem) reorderedServices.push(unipinItem);
    if (eskomItem) reorderedServices.push(eskomItem);
    
    // Add Bill Payments button
    const billPaymentsButton = {
      name: "Bill Payments",
      icon: <FileText className="h-8 w-8 text-blue-700 dark:text-blue-300" />,
      color: "bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
    };
    
    // Add Admin button
    const adminButton = {
      name: "Admin",
      icon: <Settings className="h-8 w-8 text-gray-700 dark:text-gray-300" />,
      color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-border"
    };
    
    const categories = [];
    
    if (mobileNetworks.length > 0) {
      categories.push({
        name: 'Mobile Networks',
        items: mobileNetworks
      });
    }
    
    if (reorderedServices.length > 0) {
      categories.push({
        name: 'Other Services',
        items: reorderedServices
      });
    }
    
    // Add Bill Payments and Admin as a separate category
    categories.push({
      name: 'Services',
      items: [billPaymentsButton, adminButton]
    });
    
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
    if (category === "Admin") {
      setShowAdminOptions(true);
      setShowBillPayments(false);
      setSelectedCategory(null);
    } else if (category === "Bill Payments") {
      setShowBillPayments(true);
      setShowAdminOptions(false);
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      setShowAdminOptions(false);
      setShowBillPayments(false);
      setSelectedValue(null);
      setIsVoucherInventoryLoading(true);
      
      try {
        const { data: inventoryData, error } = await fetchVoucherInventoryByType(category);
        
        if (error) {
          console.error("Error fetching inventory:", error);
          return;
        }
        
        setVoucherInventory(inventoryData || []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsVoucherInventoryLoading(false);
      }
    }
  }, []);

  // Handle Admin option selection
  const handleAdminOptionSelect = React.useCallback((option: string) => {
    setSelectedAdminOption(option);
    console.log(`Selected admin option: ${option}`);
    // Here you would implement the specific functionality for each admin option
  }, []);

  // Handle Bill Payment option selection
  const handleBillPaymentOptionSelect = React.useCallback((option: string) => {
    setSelectedBillPayment(option);
    console.log(`Selected bill payment option: ${option}`);
    // Here you would implement the specific functionality for each bill payment option
  }, []);

  // Handle value selection
  const handleValueSelect = React.useCallback(async (value: number) => {
    setSelectedValue(value);
    
    // Open confirmation dialog
    setShowConfirmDialog(true);
    
    // Fetch commission data for selected voucher
    try {
      if (selectedCategory && terminal) {
        const selectedVoucher = voucherInventory.find(
          (vt) => vt.name && vt.name.toLowerCase().includes(selectedCategory.toLowerCase()) && vt.amount === value
        );
        
        if (selectedVoucher) {
          const { data, error } = await fetchRetailerCommissionData({
            retailerId: terminal.retailer_id,
            voucherTypeId: selectedVoucher.id,
            voucherValue: value,
          });
          
          if (error) {
            setCommissionError(error.message);
            return;
          }
          
          setCommissionData({
            rate: data?.rate || 0,
            amount: data?.amount || 0,
            groupName: data?.groupName || '',
          });
        }
      }
    } catch (error) {
      setCommissionError(
        `Failed to fetch commission data: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }, [selectedCategory, voucherInventory, terminal]);

  // Handle sale confirmation
  const handleConfirmSale = React.useCallback(async () => {
    if (!selectedCategory || !selectedValue || !terminal) {
      return;
    }
    
    const selectedVoucher = voucherInventory.find(
      (vt) => vt.name && vt.name.toLowerCase().includes(selectedCategory.toLowerCase()) && vt.amount === selectedValue
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
        setSaleError(error.message);
        return;
      }
      
      if (data) {
        setSaleInfo({
          pin: data.voucher.pin,
          serial_number: data.voucher.serial_number,
        });
        
        const commissionAmount = commissionData?.amount || 0;
        const saleAmount = selectedValue;
        
        setReceiptData({
          ...data.receipt,
          voucherType: selectedCategory,
          amount: saleAmount,
          commissionAmount: commissionAmount,
          commissionRate: commissionData?.rate || 0,
        });
        
        // Update balance in context immediately after successful sale
        updateBalanceAfterSale(saleAmount, commissionAmount);
        
        // Also update the terminal object to reflect the new balance and credit
        setTerminal(prev => {
          if (!prev) return prev;
          
          // Calculate new balance and credit - mirroring the logic in TerminalContext
          let newBalance = prev.retailer_balance;
          let newCreditUsed = prev.retailer_credit_used;
          
          if (prev.retailer_balance >= saleAmount) {
            // If balance covers the full amount
            newBalance = prev.retailer_balance - saleAmount + commissionAmount;
          } else {
            // If balance doesn't cover it, use credit for the remainder
            const amountFromCredit = saleAmount - prev.retailer_balance;
            newBalance = 0 + commissionAmount;
            newCreditUsed = prev.retailer_credit_used + amountFromCredit;
          }
          
          return {
            ...prev,
            retailer_balance: newBalance,
            retailer_credit_used: newCreditUsed
          };
        });
        
        // Show success feedback
        setSaleComplete(true);
        setShowConfetti(true);
        setShowToast(true);
        setShowReceiptDialog(true);
        
        // Auto-hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }
    } catch (error) {
      setSaleError(
        `Failed to process sale: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSelling(false);
      setShowConfirmDialog(false);
    }
  }, [selectedCategory, selectedValue, voucherInventory, terminal, commissionData, updateBalanceAfterSale]);

  // Handle back to Admin options
  const handleBackToAdmin = React.useCallback(() => {
    setSelectedAdminOption(null);
  }, []);

  // Handle back to categories
  const handleBackToCategories = React.useCallback(() => {
    setSelectedCategory(null);
    setSelectedValue(null);
    setShowAdminOptions(false);
    setShowBillPayments(false);
    setSelectedAdminOption(null);
    setSelectedBillPayment(null);
  }, []);

  // Handle closing receipt
  const handleCloseReceipt = React.useCallback(() => {
    setShowReceiptDialog(false);
    setSaleComplete(false);
    setSelectedCategory(null);
    setSelectedValue(null);
  }, []);

  // Handle enter amount
  const handleEnterAmount = React.useCallback(() => {
    // Placeholder for future implementation
    console.log("Enter amount clicked");
  }, []);

  // Handle sell voucher
  const handleSellVoucher = React.useCallback(() => {
    // Placeholder for future implementation
    console.log("Sell voucher clicked");
  }, []);

  // Handle recent sales
  const handleViewRecentSales = React.useCallback(() => {
    // Placeholder for future implementation
    console.log("View recent sales clicked");
  }, []);

  // Calculate the available credit
  const availableCredit = terminal ? (terminal.retailer_credit_limit - terminal.retailer_credit_used) : 0;

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
        ) : showAdminOptions && selectedAdminOption === "Account Balance" && terminal ? (
          <AccountBalanceScreen
            retailerName={terminal.retailer_name}
            terminalName={terminal.terminal_name}
            retailerBalance={terminal.retailer_balance}
            retailerCreditLimit={terminal.retailer_credit_limit}
            retailerCreditUsed={terminal.retailer_credit_used}
            terminalCommission={terminal.retailer_commission_balance}
            onBackToAdmin={handleBackToAdmin}
          />
        ) : showAdminOptions && selectedAdminOption === "Sales History" && terminal ? (
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
            onValueSelect={handleValueSelect}
            onBackToCategories={handleBackToCategories}
          />
        ) : (
          <POSGrid
            categories={voucherCategories}
            onCategorySelect={handleCategorySelect}
          />
        )}
      </main>

      {/* Dialogs and Feedback */}
      {showConfirmDialog && selectedCategory && selectedValue && (
        <ConfirmSaleDialog
          voucherType={selectedCategory}
          amount={selectedValue}
          commissionRate={commissionData?.rate || 0}
          commissionAmount={commissionData?.amount || 0}
          isLoading={isSelling}
          error={saleError || commissionError}
          onConfirm={handleConfirmSale}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {saleComplete && saleInfo && (
        <SuccessToast
          show={showToast}
          onClose={() => setShowToast(false)}
          onViewReceipt={() => setShowReceiptDialog(true)}
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

      {showConfetti && <ConfettiOverlay />}
    </>
  );
}
