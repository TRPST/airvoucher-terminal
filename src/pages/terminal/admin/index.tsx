import * as React from 'react';
import { useRouter } from 'next/router';
import useRequireRole from '@/hooks/useRequireRole';

// Import hooks
import { useAdminOptions } from '@/hooks/useAdminOptions';

// Import components
import { AdminOptionsGrid } from '@/components/terminal/AdminOptionsGrid';

export default function AdminOptionsPage() {
  const router = useRouter();

  // Protect this route - only allow cashier role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Admin options management
  const adminOptions = useAdminOptions();
  const { handleAdminOptionSelect } = adminOptions;

  // Handle admin option selection with routing
  const handleOptionSelect = React.useCallback(
    (option: string) => {
      if (option === 'Account Balance') {
        router.push('/terminal/admin/balance');
      } else if (option === 'Sales History') {
        router.push('/terminal/admin/history');
      } else {
        // Handle other admin options
        handleAdminOptionSelect(option);
      }
    },
    [router, handleAdminOptionSelect]
  );

  // Handle back to categories
  const handleBackToCategories = React.useCallback(() => {
    router.push('/terminal');
  }, [router]);

  return (
    <main className="flex-1">
      <AdminOptionsGrid
        onOptionSelect={handleOptionSelect}
        onBackToCategories={handleBackToCategories}
      />
    </main>
  );
}
