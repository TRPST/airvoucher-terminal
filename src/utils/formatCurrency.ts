/**
 * Formats a number as South African Rand (ZAR) currency
 * 
 * @param value The numeric value to format
 * @param options Optional Intl.NumberFormatOptions to customize the output
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options?: Intl.NumberFormatOptions
): string {
  // Default options for South African Rand
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  // Use the provided options or fall back to defaults
  const formatOptions = { ...defaultOptions, ...options };
  
  // Format using the browser's Intl API
  return new Intl.NumberFormat('en-ZA', formatOptions).format(value);
}
