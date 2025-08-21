import * as React from 'react';
import {
  fetchVoucherTypesByNetworkAndCategory,
  fetchVoucherTypesByNetworkCategoryAndDuration,
  fetchVoucherInventoryByTypeId,
  type NetworkProvider,
  type VoucherCategory,
  type DataDuration,
  type VoucherType,
  type EnhancedVoucherType,
} from '@/actions';

interface UseSimpleNetworkVouchersParams {
  networkProvider: string;
  category: string;
  subCategory?: string;
}

export function useSimpleNetworkVouchers({
  networkProvider,
  category,
  subCategory,
}: UseSimpleNetworkVouchersParams) {
  const [vouchers, setVouchers] = React.useState<VoucherType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [voucherTypeId, setVoucherTypeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      setVouchers([]);
      
      try {
        // Step 1: Fetch the voucher type(s) for this network/category combination
        let voucherTypes: EnhancedVoucherType[] = [];
        
        if (subCategory) {
          // For data vouchers with duration (daily/weekly/monthly)
          const { data, error } = await fetchVoucherTypesByNetworkCategoryAndDuration(
            networkProvider as NetworkProvider,
            category as VoucherCategory,
            subCategory as DataDuration
          );
          if (!error && data) {
            voucherTypes = data;
          }
        } else {
          // For airtime or data without specific duration
          const { data, error } = await fetchVoucherTypesByNetworkAndCategory(
            networkProvider as NetworkProvider,
            category as VoucherCategory
          );
          if (!error && data) {
            voucherTypes = data;
          }
        }

        console.log(`Found ${voucherTypes.length} voucher types for ${networkProvider} ${category} ${subCategory || ''}`);

        if (voucherTypes.length === 0) {
          setIsLoading(false);
          return;
        }

        // For simplicity, if there's only one voucher type, store its ID
        if (voucherTypes.length === 1) {
          setVoucherTypeId(voucherTypes[0].id);
        }

        // Step 2: Fetch inventory for each voucher type
        const allVouchers: VoucherType[] = [];

        for (const voucherType of voucherTypes) {
          const { data: inventoryData, error: inventoryError } = await fetchVoucherInventoryByTypeId(
            voucherType.id
          );
          
          if (!inventoryError && inventoryData) {
            // The inventory data is already grouped by amount with counts
            allVouchers.push(...inventoryData);
          }
        }

        // Sort by amount
        allVouchers.sort((a, b) => a.amount - b.amount);
        
        console.log(`Total vouchers available: ${allVouchers.length}`);
        setVouchers(allVouchers);
      } catch (error) {
        console.error('Error fetching network vouchers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (networkProvider && category) {
      fetchVouchers();
    }
  }, [networkProvider, category, subCategory]);

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
    voucherTypeId,
    findVoucherByAmount,
  };
}
