# Credit System Documentation

## Overview
The AirVoucher terminal system implements a credit-based system that allows retailers to make sales even when their balance is insufficient, by using available credit.

## How It Works

### Credit Calculation
- **Available Credit** = `credit_limit - credit_used`
- **Total Available Funds** = `balance + available_credit`

### Sale Processing Logic

1. **Pre-Sale Validation**
   - Check if `total_available >= sale_amount`
   - If insufficient, show error: "Insufficient balance and credit"

2. **Balance vs Credit Usage**
   - If `balance >= sale_amount`: Use balance only
   - If `balance < sale_amount`: Use balance first, then credit for remainder

3. **Credit Usage Formula**
   ```typescript
   if (balance >= saleAmount) {
     newBalance = balance - saleAmount + commissionAmount;
     newCreditUsed = credit_used; // No change
   } else {
     amountFromCredit = saleAmount - balance;
     newBalance = 0 + commissionAmount;
     newCreditUsed = credit_used + amountFromCredit;
   }
   ```

## Database Updates

### Retailer Table Updates
```sql
UPDATE retailers SET
  balance = new_balance,
  credit_used = new_credit_used,
  commission_balance = commission_balance + commission_amount
WHERE id = retailer_id;
```

### Transaction Records
- Creates detailed transaction notes showing balance vs credit usage
- Example: "OTT Voucher Sale - R50 from balance, R25 from credit"

## OTT Sales Implementation

### Credit Validation
```typescript
const availableCredit = terminal.retailer_credit_limit - terminal.retailer_credit_used;
const totalAvailable = terminal.retailer_balance + availableCredit;

if (totalAvailable < saleAmount) {
  setSaleError(`Insufficient balance and credit. Available: R${totalAvailable.toFixed(2)}, Required: R${saleAmount.toFixed(2)}`);
  return;
}
```

### Credit Usage Logging
- Console logs show exactly how much was taken from balance vs credit
- Transaction notes include detailed breakdown

## Regular Voucher Sales

### Same Logic Applied
- Uses identical credit calculation and validation
- Updates both balance and credit_used in database
- Creates detailed transaction records

## Context Updates

### Terminal Context
- Updates `balance` and `availableCredit` in React context
- Ensures UI immediately reflects new values
- Maintains consistency across components

### Real-time Updates
- Balance and credit changes are reflected immediately in UI
- No page refresh required to see updated values

## Error Handling

### Insufficient Funds
- Validates before making API calls
- Shows clear error message with available vs required amounts
- Prevents failed transactions

### Database Errors
- Rolls back transaction if database update fails
- Shows appropriate error messages
- Maintains data integrity

## Testing Scenarios

### Scenario 1: Sufficient Balance
- Balance: R100, Credit: R50
- Sale: R30
- Result: R30 from balance, credit unchanged

### Scenario 2: Partial Credit Usage
- Balance: R20, Credit: R50
- Sale: R50
- Result: R20 from balance, R30 from credit

### Scenario 3: Full Credit Usage
- Balance: R0, Credit: R50
- Sale: R40
- Result: R0 from balance, R40 from credit

### Scenario 4: Insufficient Total
- Balance: R10, Credit: R20
- Sale: R50
- Result: Error - insufficient funds

## Monitoring and Debugging

### Console Logs
- Detailed logging of balance and credit calculations
- Shows exact amounts taken from each source
- Helps with debugging and auditing

### Transaction History
- All transactions include detailed notes
- Shows balance vs credit breakdown
- Maintains audit trail

## Best Practices

1. **Always validate before processing**
2. **Update both balance and credit_used atomically**
3. **Provide clear error messages**
4. **Log all credit usage for auditing**
5. **Maintain transaction consistency** 