import * as React from "react";
import { createContext, useContext, useState } from "react";

interface TerminalContextType {
  terminalName: string;
  retailerName: string;
  balance: number;
  availableCredit: number;
  setTerminalInfo: (terminalName: string, retailerName: string) => void;
  setBalanceInfo: (balance: number, availableCredit: number) => void;
}

const defaultContext: TerminalContextType = {
  terminalName: "",
  retailerName: "",
  balance: 0,
  availableCredit: 0,
  setTerminalInfo: () => {},
  setBalanceInfo: () => {},
};

const TerminalContext = createContext<TerminalContextType>(defaultContext);

export const useTerminal = () => useContext(TerminalContext);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [terminalName, setTerminalName] = useState("");
  const [retailerName, setRetailerName] = useState("");
  const [balance, setBalance] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);

  const setTerminalInfo = (terminalName: string, retailerName: string) => {
    setTerminalName(terminalName);
    setRetailerName(retailerName);
  };

  const setBalanceInfo = (balance: number, availableCredit: number) => {
    setBalance(balance);
    setAvailableCredit(availableCredit);
  };

  return (
    <TerminalContext.Provider
      value={{
        terminalName,
        retailerName,
        balance,
        availableCredit,
        setTerminalInfo,
        setBalanceInfo,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};
