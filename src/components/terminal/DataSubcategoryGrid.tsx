import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DataSubcategoryGridProps {
  networkProvider: string;
  availableSubcategories: string[];
  isLoading: boolean;
  onSubcategorySelect: (subcategory: string) => void;
}

export function DataSubcategoryGrid({
  networkProvider,
  availableSubcategories,
  isLoading,
  onSubcategorySelect,
}: DataSubcategoryGridProps) {
  // Define subcategory display information
  const subcategoryInfo = {
    daily: {
      name: 'Daily Data',
      icon: <Calendar className="h-12 w-12" />,
      description: 'Valid for 24 hours',
      color:
        'bg-orange-500/5 hover:bg-orange-500/10 dark:bg-orange-500/10 dark:hover:bg-orange-500/20',
    },
    weekly: {
      name: 'Weekly Data',
      icon: <CalendarDays className="h-12 w-12" />,
      description: 'Valid for 7 days',
      color:
        'bg-purple-500/5 hover:bg-purple-500/10 dark:bg-purple-500/10 dark:hover:bg-purple-500/20',
    },
    monthly: {
      name: 'Monthly Data',
      icon: <CalendarRange className="h-12 w-12" />,
      description: 'Valid for 30 days',
      color: 'bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20',
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center p-6">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-lg font-medium">Loading Data Packages...</p>
      </div>
    );
  }

  // No subcategories available
  if (availableSubcategories.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center p-6 text-center">
        <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold">No Data Packages Available</h2>
        <p className="text-muted-foreground">
          There are no data packages available for {networkProvider} at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Select Data Package Type</h2>
          <p className="text-muted-foreground">
            Choose the validity period for your {networkProvider} data package
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
    </div>
  );
}

interface SubcategoryCardProps {
  subcategory: string;
  info: {
    name: string;
    icon: React.ReactNode;
    description: string;
    color: string;
  };
  onClick: () => void;
}

function SubcategoryCard({ subcategory, info, onClick }: SubcategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 text-center transition-colors',
        info.color
      )}
    >
      <div className="mb-4 text-primary">{info.icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{info.name}</h3>
      <p className="text-sm text-muted-foreground">{info.description}</p>
    </motion.div>
  );
}
