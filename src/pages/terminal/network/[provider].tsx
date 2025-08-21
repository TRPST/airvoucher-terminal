import * as React from 'react';
import { useRouter } from 'next/router';
import useRequireRole from '@/hooks/useRequireRole';
import { NetworkOptionsGrid } from '@/components/terminal/NetworkOptionsGrid';

export default function NetworkSelectionPage() {
  const router = useRouter();
  const { provider } = router.query;

  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Convert provider back to proper case
  const providerName = React.useMemo(() => {
    if (!provider || typeof provider !== 'string') return '';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider]);

  // Handle category selection (Airtime or Data)
  const handleCategorySelect = React.useCallback(
    (category: string) => {
      if (category === 'Airtime') {
        router.push(`/terminal/network/${provider}/airtime`);
      } else if (category === 'Data') {
        router.push(`/terminal/network/${provider}/data`);
      }
    },
    [router, provider]
  );

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    router.push('/terminal');
  }, [router]);

  if (!provider || typeof provider !== 'string') {
    return (
      <main className="flex-1">
        <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">Invalid Network Provider</h2>
          <p className="mb-4 text-muted-foreground">Please select a valid network provider.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1">
        <NetworkOptionsGrid
          networkProvider={providerName}
          onCategorySelect={handleCategorySelect}
          onBackToTerminal={handleBack}
        />
      </main>
    </>
  );
}
