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
  const { fetchNetworkVoucherTypes, getAvailableDataSubcategories, isVoucherInventoryLoading } =
    useNetworkVoucherInventory();

  // Available data subcategories
  const [availableSubcategories, setAvailableSubcategories] = React.useState<string[]>([]);
  const [isProcessingSubcategories, setIsProcessingSubcategories] = React.useState(false);

  // Fetch voucher types (not inventory) for this network's data category
  React.useEffect(() => {
    if (provider && typeof provider === 'string' && isAuthorized) {
      fetchNetworkVoucherTypes(provider, 'data');
    }
  }, [provider, isAuthorized, fetchNetworkVoucherTypes]);

  // Separate effect to extract subcategories after voucher types are loaded
  React.useEffect(() => {
    if (!isVoucherInventoryLoading && provider && typeof provider === 'string') {
      setIsProcessingSubcategories(true);
      // Use a small delay to ensure refs are updated
      setTimeout(() => {
        const subcategories = getAvailableDataSubcategories(provider);
        setAvailableSubcategories(subcategories);
        setIsProcessingSubcategories(false);
      }, 100);
    }
  }, [isVoucherInventoryLoading, provider, getAvailableDataSubcategories]);

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
      {/* Main Content Area */}
      <main className="flex-1">
        <DataSubcategoryGrid
          networkProvider={providerName}
          availableSubcategories={availableSubcategories}
          isLoading={isVoucherInventoryLoading || isProcessingSubcategories}
          onSubcategorySelect={handleSubcategorySelect}
          onBack={handleBack}
        />
      </main>
    </>
  );
}
