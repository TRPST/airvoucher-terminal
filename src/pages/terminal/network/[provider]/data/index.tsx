import * as React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import useRequireRole from '@/hooks/useRequireRole';
import { useNetworkVoucherInventory } from '@/hooks/useNetworkVoucherInventory';
import { DataSubcategoryGrid } from '@/components/terminal/DataSubcategoryGrid';

export default function NetworkDataPage() {
  const router = useRouter();
  const { provider } = router.query;

  // Protect this route - only allow terminal role
  const { isLoading, user, isAuthorized } = useRequireRole('terminal');

  // Convert provider back to proper case
  const providerName = React.useMemo(() => {
    if (!provider || typeof provider !== 'string') return '';
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }, [provider]);

  // Network-specific voucher inventory management
  const { fetchNetworkVoucherInventory, getAvailableDataSubcategories, isVoucherInventoryLoading } =
    useNetworkVoucherInventory();

  // Available data subcategories
  const [availableSubcategories, setAvailableSubcategories] = React.useState<string[]>([]);

  // Fetch voucher inventory for this network's data category
  React.useEffect(() => {
    if (provider && typeof provider === 'string' && isAuthorized) {
      fetchNetworkVoucherInventory(provider, 'data').then(() => {
        // After fetching, get available subcategories
        const subcategories = getAvailableDataSubcategories(provider);
        setAvailableSubcategories(subcategories);
      });
    }
  }, [provider, isAuthorized, fetchNetworkVoucherInventory, getAvailableDataSubcategories]);

  // Handle subcategory selection
  const handleSubcategorySelect = React.useCallback(
    (subcategory: string) => {
      router.push(`/terminal/network/${provider}/data/${subcategory}`);
    },
    [router, provider]
  );

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    router.push(`/terminal/network/${provider}`);
  }, [router, provider]);

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
      {/* Header with back button */}
      <div className="flex items-center gap-4 border-b p-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {providerName}
        </button>
        <h1 className="text-xl font-semibold">{providerName} Data Packages</h1>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        <DataSubcategoryGrid
          networkProvider={providerName}
          availableSubcategories={availableSubcategories}
          isLoading={isVoucherInventoryLoading}
          onSubcategorySelect={handleSubcategorySelect}
        />
      </main>
    </>
  );
}
