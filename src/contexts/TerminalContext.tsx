import * as React from "react";

interface TerminalContextType {
  terminalName: string | null;
  retailerName: string | null;
  setTerminalInfo: (terminalName: string, retailerName: string) => void;
}

const TerminalContext = React.createContext<TerminalContextType>({
  terminalName: null,
  retailerName: null,
  setTerminalInfo: () => {},
});

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [terminalName, setTerminalName] = React.useState<string | null>(null);
  const [retailerName, setRetailerName] = React.useState<string | null>(null);

  const setTerminalInfo = React.useCallback((terminal: string, retailer: string) => {
    setTerminalName(terminal);
    setRetailerName(retailer);
  }, []);

  return (
    <TerminalContext.Provider value={{ terminalName, retailerName, setTerminalInfo }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = React.useContext(TerminalContext);
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider");
  }
  return context;
}
