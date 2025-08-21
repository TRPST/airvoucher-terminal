import * as React from 'react';
import {
  fetchVoucherInventoryByType,
  type VoucherType,
} from '@/actions';

interface UseSimpleVouchersParams {
  category: string;
}

export function useSimpleVouchers({ category }: UseSimpleVouchersParams) {
  const [vouchers, setVouchers] = React.useState<VoucherType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVouchers = async () => {
      if (!category) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setVouchers([]);
      
      try {
        // Fetch inventory directly by category name
        const { data: inventoryData, error } = await fetchVoucherInventoryByType(category);

        if (error) {
          console.error('Error fetching inventory:', error);
          setIsLoading(false);
          return;
        }

        // Filter for available vouchers with count > 0
        const availableVouchers = (inventoryData || []).filter(
          voucher => voucher.count > 0
        );

        // Sort by amount
        availableVouchers.sort((a, b) => a.amount - b.amount);
        
        console.log(`Found ${availableVouchers.length} vouchers for category: ${category}`);
        setVouchers(availableVouchers);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, [category]);

  // Simple function to find a voucher by amount
  const findVoucherByAmount = React.useCallback(
    (amount: number) => {
      return vouchers.find(v => v.amount === amount);
    },
    [vouchers]
  );

  return {
    vouchers,
    isLoading,
    findVoucherByAmount,
  };
}
