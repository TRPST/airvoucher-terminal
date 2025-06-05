import * as React from 'react';
import { fetchVoucherInventoryByType, type VoucherType } from '@/actions';

export function useVoucherInventory() {
  const [voucherInventory, setVoucherInventory] = React.useState<VoucherType[]>([]);
  const [isVoucherInventoryLoading, setIsVoucherInventoryLoading] = React.useState(false);

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

  // Function to get vouchers for a specific category
  const getVouchersForCategory = React.useCallback(
    (category: string) => {
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
    },
    [voucherInventory]
  );

  // Function to find a specific voucher
  const findVoucher = React.useCallback(
    (category: string, value: number) => {
      return voucherInventory.find(
        (vt) =>
          vt.name && vt.name.toLowerCase().includes(category.toLowerCase()) && vt.amount === value
      );
    },
    [voucherInventory]
  );

  return {
    voucherInventory,
    isVoucherInventoryLoading,
    fetchVoucherInventory,
    getVouchersForCategory,
    findVoucher,
  };
}
