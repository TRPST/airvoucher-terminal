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
  // Debug check - log categories
  console.log("POSGrid Categories:", categories);
  
  // Flatten all items from all category groups into a single array
  // and filter out any items with missing names or icons
  const allItems = categories
    .flatMap(group => {
      console.log(`Category ${group.name} items:`, group.items);
      return group.items;
    })
    .filter(item => {
      // Skip items without a name
      if (!item || !item.name || item.name.trim() === '') {
        return false;
      }
      
      // Skip items without an icon
      if (!item.icon) {
        return false;
      }
      
      // Skip bill payment options except for the Bill Payments button itself
      const isBillPaymentsButton = item.name === "Bill Payments";
      const isBillPaymentOption = ['MangaungMunicipality', 'Mukuru', 'Ecocash'].includes(item.name);
      
      if (isBillPaymentOption && !isBillPaymentsButton) {
        console.log("Filtering out bill payment option:", item.name);
        return false;
      }
      
      return true;
    });
  
  console.log("Filtered Items:", allItems);
  
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
  const isSpecialButton = name === "Admin" || name === "Bill Payments";
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`h-32 w-full max-w-[180px] mx-auto flex ${isSpecialButton ? 'flex-col' : ''} items-center justify-center cursor-pointer border rounded-lg ${color}`}
    >
      {icon}
      {isSpecialButton && <span className="mt-2 font-medium">{name}</span>}
    </motion.div>
  );
} 