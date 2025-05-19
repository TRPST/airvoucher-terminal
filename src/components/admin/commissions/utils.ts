// Categorized voucher types
export type VoucherTypeCategory = {
  category: string;
  types: { id: string; name: string }[];
};

/**
 * Categorize voucher types into groups
 */
export function categorizeVoucherTypes(types: { id: string; name: string }[]): VoucherTypeCategory[] {
  // Mobile network providers
  const mobileNetworks = types.filter(type => 
    ['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
      network => type.name.includes(network)
    )
  );
  
  // Other types (those not in mobile networks)
  const otherTypes = types.filter(type => 
    !['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
      network => type.name.includes(network)
    )
  );
  
  const categories: VoucherTypeCategory[] = [];
  
  // Add mobile networks category if there are any
  if (mobileNetworks.length > 0) {
    categories.push({
      category: 'Mobile Networks',
      types: mobileNetworks
    });
  }
  
  // Add others as a category
  if (otherTypes.length > 0) {
    categories.push({
      category: 'Other Services',
      types: otherTypes
    });
  }
  
  return categories;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
