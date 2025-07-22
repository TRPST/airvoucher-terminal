import * as React from 'react';
import { createContext, useContext, useState } from 'react';

interface VoucherType {
  id: string;
  name: string;
  // Add other voucher properties as needed
}

interface SaleInfo {
  pin: string;
  // Add other sale info properties as needed
}

interface ReceiptData {
  // Add receipt data properties as needed
  [key: string]: any;
}

interface CommissionData {
  rate: number;
  amount: number;
  isOverride: boolean;
}

interface SaleContextType {
  // Sale state
  selectedCategory: string | null;
  selectedValue: number | null;
  selectedVoucher: VoucherType | null;
  commissionData: CommissionData | null;

  // Dialog and feedback state
  showConfirmDialog: boolean;
  showToast: boolean;
  showReceiptDialog: boolean;
  showConfetti: boolean;

  // Sale status
  isSelling: boolean;
  saleComplete: boolean;
  saleError: string | null;
  saleInfo: SaleInfo | null;
  receiptData: ReceiptData | null;

  // Actions
  setSelectedCategory: (category: string | null) => void;
  setSelectedValue: (value: number | null) => void;
  setSelectedVoucher: (voucher: VoucherType | null) => void;
  setCommissionData: (data: CommissionData | null) => void;
  setShowConfirmDialog: (show: boolean) => void;
  setShowToast: (show: boolean) => void;
  setShowReceiptDialog: (show: boolean) => void;
  setShowConfetti: (show: boolean) => void;
  setIsSelling: (selling: boolean) => void;
  setSaleComplete: (complete: boolean) => void;
  setSaleError: (error: string | null) => void;
  setSaleInfo: (info: SaleInfo | null) => void;
  setReceiptData: (data: ReceiptData | null) => void;

  // Complex actions
  initiateSale: (category: string, value: number, voucher: VoucherType | null) => void;
  completeSale: (saleInfo: SaleInfo, receiptData: ReceiptData) => void;
  resetSale: () => void;
}

const defaultContext: SaleContextType = {
  selectedCategory: null,
  selectedValue: null,
  selectedVoucher: null,
  commissionData: null,
  showConfirmDialog: false,
  showToast: false,
  showReceiptDialog: false,
  showConfetti: false,
  isSelling: false,
  saleComplete: false,
  saleError: null,
  saleInfo: null,
  receiptData: null,
  setSelectedCategory: () => {},
  setSelectedValue: () => {},
  setSelectedVoucher: () => {},
  setCommissionData: () => {},
  setShowConfirmDialog: () => {},
  setShowToast: () => {},
  setShowReceiptDialog: () => {},
  setShowConfetti: () => {},
  setIsSelling: () => {},
  setSaleComplete: () => {},
  setSaleError: () => {},
  setSaleInfo: () => {},
  setReceiptData: () => {},
  initiateSale: () => {},
  completeSale: () => {},
  resetSale: () => {},
};

const SaleContext = createContext<SaleContextType>(defaultContext);

export const useSale = () => useContext(SaleContext);

export const SaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sale state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);

  // Dialog and feedback state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sale status
  const [isSelling, setIsSelling] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [saleInfo, setSaleInfo] = useState<SaleInfo | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Complex actions
  const initiateSale = React.useCallback(
    (category: string, value: number, voucher: VoucherType | null) => {
      setSelectedCategory(category);
      setSelectedValue(value);
      setSelectedVoucher(voucher);
      setShowConfirmDialog(true);
      setSaleError(null);
    },
    []
  );

  const completeSale = React.useCallback((saleInfo: SaleInfo, receiptData: ReceiptData) => {
    setSaleInfo(saleInfo);
    setReceiptData(receiptData);
    setSaleComplete(true);
    setShowConfirmDialog(false);
    setShowToast(true);
    setShowConfetti(true);
    setIsSelling(false);

    // Auto-hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, []);

  const resetSale = React.useCallback(() => {
    setSelectedCategory(null);
    setSelectedValue(null);
    setSelectedVoucher(null);
    setCommissionData(null);
    setShowConfirmDialog(false);
    setShowToast(false);
    setShowReceiptDialog(false);
    setShowConfetti(false);
    setIsSelling(false);
    setSaleComplete(false);
    setSaleError(null);
    setSaleInfo(null);
    setReceiptData(null);
  }, []);

  return (
    <SaleContext.Provider
      value={{
        selectedCategory,
        selectedValue,
        selectedVoucher,
        commissionData,
        showConfirmDialog,
        showToast,
        showReceiptDialog,
        showConfetti,
        isSelling,
        saleComplete,
        saleError,
        saleInfo,
        receiptData,
        setSelectedCategory,
        setSelectedValue,
        setSelectedVoucher,
        setCommissionData,
        setShowConfirmDialog,
        setShowToast,
        setShowReceiptDialog,
        setShowConfetti,
        setIsSelling,
        setSaleComplete,
        setSaleError,
        setSaleInfo,
        setReceiptData,
        initiateSale,
        completeSale,
        resetSale,
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};
