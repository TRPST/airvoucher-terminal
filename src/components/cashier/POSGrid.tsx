import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

type CategoryItem = {
  name: string;
  icon: React.ReactNode;
  color: string;
};

type CategoryGroup = {
  name: string;
  items: CategoryItem[];
};

interface POSGridProps {
  categories: CategoryGroup[];
  onCategorySelect: (category: string) => void;
}

export function POSGrid({ categories, onCategorySelect }: POSGridProps) {
  // Flatten all items from all category groups into a single array
  const allItems = categories.flatMap(group => group.items);
  
  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 max-w-4xl mx-auto">
        {allItems.map((item) => (
          <POSButton
            key={item.name}
            name={item.name}
            icon={item.icon}
            color={item.color}
            onClick={() => onCategorySelect(item.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface POSButtonProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function POSButton({ name, icon, color, onClick }: POSButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="h-32 w-full max-w-[180px] mx-auto flex items-center justify-center cursor-pointer border rounded-lg"
    >
      {icon}
    </motion.div>
  );
} 