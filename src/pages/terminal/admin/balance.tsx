import * as React from 'react';
import { useRouter } from 'next/router';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useTerminalData } from '@/hooks/useTerminalData';

// Import components
import { AccountBalanceScreen } from '@/components/terminal/AccountBalanceScreen';

export default function AccountBalancePage() {
  const router = useRouter();

  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Get the current user ID
  const userId = user?.id;

  // Terminal data
  const { terminal } = useTerminalData(userId, isAuthorized);

  // Handle back to admin
  const handleBackToAdmin = React.useCallback(() => {
    router.push('/terminal/admin');
  }, [router]);

  if (!terminal) {
    return (
      <main className="flex-1">
        <div className="flex h-96 flex-col items-center justify-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-lg font-medium">Loading Account Balance...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <AccountBalanceScreen
        retailerName={terminal.retailer_name}
        terminalName={terminal.terminal_name}
        retailerBalance={terminal.retailer_balance}
        retailerCreditLimit={terminal.retailer_credit_limit}
        retailerCreditUsed={terminal.retailer_credit_used}
        terminalCommission={terminal.retailer_commission_balance}
        onBackToAdmin={handleBackToAdmin}
      />
    </main>
  );
}
