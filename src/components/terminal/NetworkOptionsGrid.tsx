import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface NetworkOptionsGridProps {
  networkProvider: string;
  onCategorySelect: (category: string) => void;
  onBackToTerminal: () => void;
}

export function NetworkOptionsGrid({
  networkProvider,
  onCategorySelect,
  onBackToTerminal,
}: NetworkOptionsGridProps) {
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

  const categories = [
    {
      name: 'Airtime',
      logo: networkLogo,
      color: 'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20',
    },
    {
      name: 'Data',
      logo: networkLogo,
      color: 'bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',
    },
  ];

  // Header component similar to POSValuesGrid
  const Header = () => (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToTerminal}
          className="flex items-center space-x-1 self-start"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="mt-5 whitespace-nowrap text-xl font-bold sm:hidden">
          {networkProvider} Vouchers
        </h2>
      </div>
      <h2 className="hidden whitespace-nowrap text-xl font-bold sm:block">
        {networkProvider} Vouchers
      </h2>
      <div className="hidden w-20 sm:block"></div>
    </div>
  );

  return (
    <div className="px-4 py-6">
      <Header />

      <div className="mx-auto flex max-w-4xl justify-center gap-8">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            onClick={() => onCategorySelect(category.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: {
    name: string;
    logo: string;
    color: string;
  };
  onClick: () => void;
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
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
      {/* Logo container matching POSGrid structure exactly */}
      <div
        className={`mx-auto flex h-32 w-full max-w-[180px] items-center justify-center rounded-lg border ${category.color}`}
      >
        <img
          src={category.logo}
          alt={category.name}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>
      {/* Category name underneath the container */}
      <span className="mt-2 text-sm font-medium">{category.name}</span>
    </motion.div>
  );
}
