import * as React from 'react';
import { CreditCard } from 'lucide-react';
import { useRouter } from 'next/router';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useTerminalData } from '@/hooks/useTerminalData';
import { useVoucherCategories } from '@/components/terminal/VoucherCategoriesProcessor';

// Import components
import { POSGrid } from '@/components/terminal/POSGrid';

export default function TerminalPOS() {
  const router = useRouter();

  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Get the current user ID
  const userId = user?.id;

  // Terminal and voucher data
  const { voucherTypeNames, isDataLoading, dataError } = useTerminalData(userId, isAuthorized);

  // Process voucher categories
  const voucherCategories = useVoucherCategories(voucherTypeNames);

  // Handle category selection with routing
  const handleCategorySelect = React.useCallback(
    (category: string) => {
      if (category === 'Admin') {
        router.push('/terminal/admin');
      } else if (category === 'Bill Payments') {
        router.push('/terminal/bills');
      } else {
        // Navigate to category-specific voucher values page
        router.push(`/terminal/category/${encodeURIComponent(category.toLowerCase())}`);
      }
    },
    [router]
  );

  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1">
        {isDataLoading ? (
          <div className="flex h-96 flex-col items-center justify-center">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-lg font-medium">Loading Cashier Terminal...</p>
          </div>
        ) : dataError ? (
          <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
              <CreditCard className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Terminal Error</h2>
            <p className="mb-4 text-muted-foreground">{dataError}</p>
          </div>
        ) : (
          <POSGrid categories={voucherCategories} onCategorySelect={handleCategorySelect} />
        )}
      </main>

      {/* Sale dialogs will be handled on individual category pages */}
    </>
  );
}
