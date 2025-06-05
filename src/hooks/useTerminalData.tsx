import * as React from 'react';
import {
  fetchCashierTerminal,
  fetchAvailableVoucherTypes,
  fetchVoucherInventoryByType,
  fetchRetailerCommissionData,
  sellVoucher,
  type CashierTerminalProfile,
  type VoucherType,
} from '@/actions';
import { useTerminal } from '@/contexts/TerminalContext';

export function useTerminalData(userId: string | undefined, isAuthorized: boolean) {
  // State for terminal/cashier data and loading/error states
  const [terminal, setTerminal] = React.useState<CashierTerminalProfile | null>(null);
  const [voucherTypeNames, setVoucherTypeNames] = React.useState<string[]>([]);
  const [voucherInventory, setVoucherInventory] = React.useState<VoucherType[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isVoucherInventoryLoading, setIsVoucherInventoryLoading] = React.useState(false);
  const [dataError, setDataError] = React.useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = React.useState(false);
  const [commissionData, setCommissionData] = React.useState<{
    rate: number;
    amount: number;
    groupName: string;
  } | null>(null);
  const [commissionError, setCommissionError] = React.useState<string | null>(null);
  const [retailerCommissions, setRetailerCommissions] = React.useState<number>(0);
  const [terminalCommissions, setTerminalCommissions] = React.useState<number>(0);

  const { setTerminalInfo, setBalanceInfo, setBalanceLoading } = useTerminal();

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
          setDataError('No terminal profile found for this cashier');
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

        // For demo purposes - would normally come from an API call
        // Terminal commissions should be less than retailer total commissions
        setTerminalCommissions(parseFloat((Math.random() * 300 + 100).toFixed(2)));
      } catch (err) {
        setDataError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsDataLoading(false);
        setIsBalanceLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized, setBalanceLoading]);

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
    }
  }, [terminal, setTerminalInfo, setBalanceInfo]);

  // Function to fetch voucher inventory for a category
  const fetchVoucherInventory = React.useCallback(async (category: string) => {
    setIsVoucherInventoryLoading(true);
    try {
      const { data: inventoryData, error } = await fetchVoucherInventoryByType(category);

      if (error) {
        console.error('Error fetching inventory:', error);
        return;
      }

      setVoucherInventory(inventoryData || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsVoucherInventoryLoading(false);
    }
  }, []);

  // Function to fetch commission data
  const fetchCommissionData = React.useCallback(
    async (voucherTypeId: string, voucherValue: number) => {
      if (!terminal) return null;

      try {
        const { data, error } = await fetchRetailerCommissionData({
          retailerId: terminal.retailer_id,
          voucherTypeId: voucherTypeId,
          voucherValue: voucherValue,
        });

        if (error) {
          setCommissionError(error.message);
          return null;
        }

        const commData = {
          rate: data?.rate || 0,
          amount: data?.amount || 0,
          groupName: data?.groupName || '',
        };

        setCommissionData(commData);
        return commData;
      } catch (error) {
        setCommissionError(
          `Failed to fetch commission data: ${error instanceof Error ? error.message : String(error)}`
        );
        return null;
      }
    },
    [terminal]
  );

  return {
    terminal,
    setTerminal,
    voucherTypeNames,
    voucherInventory,
    isDataLoading,
    isVoucherInventoryLoading,
    dataError,
    isBalanceLoading,
    commissionData,
    commissionError,
    retailerCommissions,
    terminalCommissions,
    fetchVoucherInventory,
    fetchCommissionData,
  };
}
