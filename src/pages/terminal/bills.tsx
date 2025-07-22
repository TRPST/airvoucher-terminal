import * as React from 'react';
import { useRouter } from 'next/router';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useAdminOptions } from '@/hooks/useAdminOptions';

// Import components
import { BillPaymentsGrid } from '@/components/terminal/BillPaymentsGrid';

export default function BillPaymentsPage() {
  const router = useRouter();

  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Admin options management (for bill payment handling)
  const adminOptions = useAdminOptions();
  const { handleBillPaymentOptionSelect } = adminOptions;

  // Handle back to categories
  const handleBackToCategories = React.useCallback(() => {
    router.push('/terminal');
  }, [router]);

  return (
    <main className="flex-1">
      <BillPaymentsGrid
        onOptionSelect={handleBillPaymentOptionSelect}
        onBackToCategories={handleBackToCategories}
      />
    </main>
  );
}
