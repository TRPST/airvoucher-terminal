# Voucher Loading Simplification Summary

## Problem
The voucher loading system was overly complex and buggy:
- On initial load of the airtime screen, no vouchers showed up
- Vouchers only appeared after manually refreshing the screen
- The `useNetworkVoucherInventory` hook was doing too much:
  - Fetching voucher types first
  - Then looping through each type to fetch inventory separately
  - This created timing issues and multiple API calls
- The `useVoucherInventory` hook had similar complexity issues for general vouchers

## Solution
Created a simplified approach that:
1. Tracks the chosen voucher type ID
2. Fetches matching voucher_inventory items directly
3. Returns grouped inventory ready for display

## Changes Made

### 1. New Simplified Hooks
Created two new hooks:
- `src/hooks/useSimpleNetworkVouchers.tsx`: For network-specific vouchers (airtime/data)
  - Takes network provider, category, and optional subcategory as parameters
  - Fetches matching voucher type(s) in a single query
  - Fetches all inventory for those types
  - Returns vouchers sorted by amount
  - Provides a simple `findVoucherByAmount` function

- `src/hooks/useSimpleVouchers.tsx`: For general voucher categories
  - Takes category name as parameter
  - Directly fetches inventory by category
  - Filters for available vouchers with count > 0
  - Returns sorted vouchers with `findVoucherByAmount` function

### 2. Updated Network Pages
Modified network voucher pages:
- `src/pages/terminal/network/[provider]/airtime.tsx`
- `src/pages/terminal/network/[provider]/data/[duration].tsx`

Changes:
- Replaced `useNetworkVoucherInventory` with `useSimpleNetworkVouchers`
- Removed complex state management
- Simplified voucher lookup to use `findVoucherByAmount`
- Directly passes vouchers array to the grid component

### 3. Updated General Category Page
Modified `src/pages/terminal/category/[slug].tsx`:
- Replaced `useVoucherInventory` with `useSimpleVouchers`
- Removed unnecessary voucher fetching logic
- Simplified commission data fetching

### 4. Removed Old Hooks
Deleted the following hooks as they're no longer needed:
- `src/hooks/useNetworkVoucherInventory.tsx`
- `src/hooks/useVoucherInventory.tsx`

## Benefits
1. **Single source of truth**: The voucher type ID is tracked once and used to fetch inventory
2. **Fewer API calls**: Reduced from N+1 queries to just 1-3 queries total
3. **No timing issues**: Vouchers load correctly on first render
4. **Simpler code**: Removed complex filtering and state management
5. **Better performance**: Less re-rendering and faster initial load
6. **Consistent approach**: Both network and general vouchers use the same simplified pattern

## Technical Details
The new hooks leverage existing functions:
- `fetchVoucherInventoryByTypeId`: For network vouchers
- `fetchVoucherInventoryByType`: For general vouchers

Both functions:
- Already group vouchers by amount
- Return count of available vouchers per amount
- Handle pagination for large inventories
- Filter for status = 'available'

## Result
All voucher-related screens now:
- Load vouchers immediately without refresh
- Use a consistent, simple approach
- Have better performance and maintainability
- Are easier to debug and extend
