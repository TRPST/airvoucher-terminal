import * as React from "react";
import { createContext, useContext, useState } from "react";

interface TerminalContextType {
  terminalName: string;
  retailerName: string;
  balance: number;
  availableCredit: number;
  isBalanceLoading: boolean;
  setTerminalInfo: (terminalName: string, retailerName: string) => void;
  setBalanceInfo: (balance: number, availableCredit: number) => void;
  setBalanceLoading: (isLoading: boolean) => void;
  updateBalanceAfterSale: (saleAmount: number, commissionAmount: number) => void;
}

const defaultContext: TerminalContextType = {
  terminalName: "",
  retailerName: "",
  balance: 0,
  availableCredit: 0,
  isBalanceLoading: true,
  setTerminalInfo: () => {},
  setBalanceInfo: () => {},
  setBalanceLoading: () => {},
  updateBalanceAfterSale: () => {},
};

const TerminalContext = createContext<TerminalContextType>(defaultContext);

export const useTerminal = () => useContext(TerminalContext);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [terminalName, setTerminalName] = useState("");
  const [retailerName, setRetailerName] = useState("");
  const [balance, setBalance] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);

  const setTerminalInfo = (terminalName: string, retailerName: string) => {
    setTerminalName(terminalName);
    setRetailerName(retailerName);
  };

  const setBalanceInfo = (balance: number, availableCredit: number) => {
    setBalance(balance);
    setAvailableCredit(availableCredit);
    setIsBalanceLoading(false);
  };

  const setBalanceLoading = (isLoading: boolean) => {
    setIsBalanceLoading(isLoading);
  };

  // This function updates the balance after a sale
  const updateBalanceAfterSale = (saleAmount: number, commissionAmount: number) => {
    // Calculate new balance after sale and commission
    let newBalance = balance;
    let newAvailableCredit = availableCredit;

    // First, deduct the sale amount from balance if possible
    if (balance >= saleAmount) {
      // If balance covers the full amount
      newBalance = balance - saleAmount + commissionAmount;
    } else {
      // If balance doesn't cover it, use credit for the remainder
      const amountFromCredit = saleAmount - balance;
      newBalance = 0 + commissionAmount; // Balance becomes 0 plus any commission
      newAvailableCredit = availableCredit - amountFromCredit; // Reduce available credit
    }

    // Update both values in state
    setBalance(newBalance);
    setAvailableCredit(newAvailableCredit);

    // Call setBalanceInfo to ensure context subscribers are notified
    setBalanceInfo(newBalance, newAvailableCredit);
  };

  return (
    <TerminalContext.Provider
      value={{
        terminalName,
        retailerName,
        balance,
        availableCredit,
        isBalanceLoading,
        setTerminalInfo,
        setBalanceInfo,
        setBalanceLoading,
        updateBalanceAfterSale,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};
