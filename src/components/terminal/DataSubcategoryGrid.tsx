import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, CalendarRange, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface DataSubcategoryGridProps {
  networkProvider: string;
  availableSubcategories: string[];
  isLoading: boolean;
  onSubcategorySelect: (subcategory: string) => void;
  onBack: () => void;
}

export function DataSubcategoryGrid({
  networkProvider,
  availableSubcategories,
  isLoading,
  onSubcategorySelect,
  onBack,
}: DataSubcategoryGridProps) {
  console.log('loading? ', isLoading);
  // Get the appropriate logo based on network provider
  const getNetworkLogo = (provider: string) => {
    const providerLower = provider.toLowerCase();
    switch (providerLower) {
      case 'mtn':
        return '/assets/vouchers/mtn-logo.jpg';
      case 'vodacom':
        return '/assets/vouchers/vodacom-logo.png';
      case 'cellc':
        return '/assets/vouchers/cellc-logo.png';
      case 'telkom':
        return '/assets/vouchers/telkom-logo.png';
      default:
        return '/assets/vouchers/mtn-logo.jpg'; // fallback
    }
  };

  const networkLogo = getNetworkLogo(networkProvider);

  // Define subcategory display information
  const subcategoryInfo = {
    daily: {
      name: 'Daily Data',
      logo: networkLogo,
      description: 'Valid for 24 hours',
      color:
        'bg-orange-500/5 hover:bg-orange-500/10 dark:bg-orange-500/10 dark:hover:bg-orange-500/20',
    },
    weekly: {
      name: 'Weekly Data',
      logo: networkLogo,
      description: 'Valid for 7 days',
      color:
        'bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-500/10 dark:hover:bg-purple-500/20',
    },
    monthly: {
      name: 'Monthly Data',
      logo: networkLogo,
      description: 'Valid for 30 days',
      color: 'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20',
    },
  };

  // Header component similar to NetworkOptionsGrid
  const Header = () => (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-1 self-start"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="mt-5 whitespace-nowrap text-xl font-bold sm:hidden">
          {networkProvider.toLowerCase() === 'mtn' ? 'MTN' : networkProvider} Data Packages
        </h2>
      </div>
      <h2 className="hidden whitespace-nowrap text-xl font-bold sm:block">
        {networkProvider.toLowerCase() === 'mtn' ? 'MTN' : networkProvider} Data Packages
      </h2>
      <div className="hidden w-20 sm:block"></div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <Header />
        <div className="flex h-96 flex-col items-center justify-center p-6">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-lg font-medium">Loading Data Packages...</p>
        </div>
      </div>
    );
  }

  // No subcategories available
  if (!isLoading && availableSubcategories.length === 0) {
    return (
      <div className="px-4 py-6">
        <Header />
        <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
          <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-bold">No Data Packages Available</h2>
          <p className="text-muted-foreground">
            There are no data packages available for {networkProvider} at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <Header />

      <div className="mx-auto flex max-w-4xl justify-center gap-8">
        {availableSubcategories.map((subcategory) => {
          const info = subcategoryInfo[subcategory as keyof typeof subcategoryInfo];
          if (!info) return null;

          return (
            <SubcategoryCard
              key={subcategory}
              subcategory={subcategory}
              info={info}
              onClick={() => onSubcategorySelect(subcategory)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface SubcategoryCardProps {
  subcategory: string;
  info: {
    name: string;
    logo: string;
    description: string;
    color: string;
  };
  onClick: () => void;
}

function SubcategoryCard({ subcategory, info, onClick }: SubcategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center justify-center"
      style={{
        width: '200px',
      }}
    >
      {/* Logo container matching NetworkOptionsGrid structure exactly */}
      <div
        className={`mx-auto flex h-32 w-full max-w-[180px] items-center justify-center rounded-lg border ${info.color}`}
      >
        <img src={info.logo} alt={info.name} className="h-full w-full rounded-lg object-cover" />
      </div>
      {/* Category name underneath the container */}
      <span className="mt-2 text-sm font-medium">{info.name}</span>
    </motion.div>
  );
}
