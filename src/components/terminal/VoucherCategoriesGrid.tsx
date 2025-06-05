import * as React from "react";
import { VoucherCategory } from "./VoucherCategory";

type CategoryItem = {
  name: string;
  icon: React.ReactNode;
  color: string;
};

type CategoryGroup = {
  name: string;
  items: CategoryItem[];
};

type VoucherCategoriesGridProps = {
  categories: CategoryGroup[];
  onCategorySelect: (category: string) => void;
};

export const VoucherCategoriesGrid: React.FC<VoucherCategoriesGridProps> = ({
  categories,
  onCategorySelect,
}) => {
  return (
    <div>
      {categories.map((categoryGroup) => (
        <div key={categoryGroup.name} className="mb-6">
          <h3 className="mb-3 text-md font-medium text-muted-foreground">
            {categoryGroup.name}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categoryGroup.items.map((category) => (
              <VoucherCategory
                key={category.name}
                name={category.name}
                icon={category.icon}
                color={category.color}
                onClick={() => onCategorySelect(category.name)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
