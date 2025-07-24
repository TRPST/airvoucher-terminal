import * as React from 'react';
import {
  fetchVoucherTypesByNetwork,
  fetchVoucherTypesByNetworkAndCategory,
  fetchVoucherTypesByNetworkCategoryAndDuration,
  fetchVoucherInventoryByType,
  type EnhancedVoucherType,
  type NetworkProvider,
  type VoucherCategory,
  type DataDuration,
  type VoucherType,
} from '@/actions';

export function useNetworkVoucherInventory() {
  const [voucherTypes, setVoucherTypes] = React.useState<EnhancedVoucherType[]>([]);
  const [voucherInventory, setVoucherInventory] = React.useState<VoucherType[]>([]);
  const [isVoucherInventoryLoading, setIsVoucherInventoryLoading] = React.useState(true);

  // Use refs to store latest state values without causing re-renders
  const voucherTypesRef = React.useRef<EnhancedVoucherType[]>([]);
  const voucherInventoryRef = React.useRef<VoucherType[]>([]);

  // Update refs when state changes
  React.useEffect(() => {
    voucherTypesRef.current = voucherTypes;
  }, [voucherTypes]);

  React.useEffect(() => {
    voucherInventoryRef.current = voucherInventory;
  }, [voucherInventory]);

  // Function to fetch only voucher types (without inventory) for a network provider and category
  const fetchNetworkVoucherTypes = React.useCallback(
    async (networkProvider: string, category: string) => {
      setIsVoucherInventoryLoading(true);
      try {
        // Fetch by network and category (types only, no inventory)
        const { data, error } = await fetchVoucherTypesByNetworkAndCategory(
          networkProvider as NetworkProvider,
          category as VoucherCategory
        );
        if (error) {
          console.error('Error fetching network category voucher types:', error);
          return;
        }

        const voucherTypesData = data || [];
        setVoucherTypes(voucherTypesData);

        // Don't fetch inventory - just set empty array
        setVoucherInventory([]);
      } catch (error) {
        console.error('Error fetching network voucher types:', error);
      } finally {
        setIsVoucherInventoryLoading(false);
      }
    },
    []
  );

  // Function to fetch voucher types and inventory for a network provider and category
  const fetchNetworkVoucherInventory = React.useCallback(
    async (networkProvider: string, category: string, subCategory?: string) => {
      setIsVoucherInventoryLoading(true);
      try {
        let voucherTypesData: EnhancedVoucherType[] = [];

        // Use the appropriate API function based on parameters
        if (subCategory) {
          // Fetch specific duration (daily/weekly/monthly)
          const { data, error } = await fetchVoucherTypesByNetworkCategoryAndDuration(
            networkProvider as NetworkProvider,
            category as VoucherCategory,
            subCategory as DataDuration
          );
          if (error) {
            console.error('Error fetching network duration voucher types:', error);
            return;
          }
          voucherTypesData = data || [];
        } else {
          // Fetch by network and category
          const { data, error } = await fetchVoucherTypesByNetworkAndCategory(
            networkProvider as NetworkProvider,
            category as VoucherCategory
          );
          if (error) {
            console.error('Error fetching network category voucher types:', error);
            return;
          }
          voucherTypesData = data || [];
        }

        setVoucherTypes(voucherTypesData);

        // Now fetch inventory for each voucher type
        const allInventory: VoucherType[] = [];
        for (const voucherType of voucherTypesData) {
          const { data: inventoryData, error: inventoryError } = await fetchVoucherInventoryByType(
            voucherType.name
          );
          if (!inventoryError && inventoryData) {
            allInventory.push(...inventoryData);
          }
        }

        setVoucherInventory(allInventory);
      } catch (error) {
        console.error('Error fetching network inventory:', error);
      } finally {
        setIsVoucherInventoryLoading(false);
      }
    },
    []
  );

  // Function to get vouchers for a specific network and category
  const getVouchersForNetworkCategory = React.useCallback(
    (networkProvider: string, category: string, subCategory?: string) => {
      const currentVoucherInventory = voucherInventoryRef.current;
      const currentVoucherTypes = voucherTypesRef.current;

      if (!currentVoucherInventory || currentVoucherInventory.length === 0) {
        return [];
      }

      // Filter voucher types that match our criteria (case-insensitive)
      const matchingTypes = currentVoucherTypes.filter((type) => {
        // Case-insensitive comparison for network provider
        if (type.network_provider?.toLowerCase() !== networkProvider.toLowerCase()) return false;
        if (type.category !== category) return false;
        if (subCategory && type.sub_category !== subCategory) return false;
        return true;
      });

      // Get inventory for matching types
      return currentVoucherInventory.filter((voucher) => {
        if (!voucher.name || voucher.count <= 0) return false;

        // Check if this voucher belongs to any of our matching types
        return matchingTypes.some((type) => type.name === voucher.name);
      });
    },
    [] // No dependencies needed since we use refs
  );

  // Function to find a specific voucher by network, category, and value
  const findNetworkVoucher = React.useCallback(
    (networkProvider: string, category: string, value: number, subCategory?: string) => {
      const currentVoucherInventory = voucherInventoryRef.current;
      const currentVoucherTypes = voucherTypesRef.current;

      // Filter voucher types that match our criteria (case-insensitive)
      const matchingTypes = currentVoucherTypes.filter((type) => {
        // Case-insensitive comparison for network provider
        if (type.network_provider?.toLowerCase() !== networkProvider.toLowerCase()) return false;
        if (type.category !== category) return false;
        if (subCategory && type.sub_category !== subCategory) return false;
        return true;
      });

      // Find inventory item with matching value
      return currentVoucherInventory.find((voucher) => {
        if (!voucher.name || voucher.amount !== value) return false;

        // Check if this voucher belongs to any of our matching types
        return matchingTypes.some((type) => type.name === voucher.name);
      });
    },
    [] // No dependencies needed since we use refs
  );

  // Function to get available subcategories for a network provider's data category
  const getAvailableDataSubcategories = React.useCallback(
    (networkProvider: string) => {
      const currentVoucherTypes = voucherTypesRef.current;

      if (!currentVoucherTypes || currentVoucherTypes.length === 0) {
        return [];
      }

      const subcategories = new Set<string>();

      currentVoucherTypes.forEach((type) => {
        if (
          type.network_provider?.toLowerCase() === networkProvider.toLowerCase() &&
          type.category === 'data' &&
          type.sub_category
        ) {
          subcategories.add(type.sub_category);
        }
      });

      return Array.from(subcategories);
    },
    [] // No dependencies needed since we use refs
  );

  return {
    voucherInventory,
    isVoucherInventoryLoading,
    fetchNetworkVoucherTypes,
    fetchNetworkVoucherInventory,
    getVouchersForNetworkCategory,
    findNetworkVoucher,
    getAvailableDataSubcategories,
  };
}
