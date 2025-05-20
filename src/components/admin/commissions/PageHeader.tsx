import * as React from "react";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  onAddClick: () => void;
}

export function PageHeader({ onAddClick }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Commission Groups
        </h1>
        <p className="text-muted-foreground">
          Manage commission rates for retailers and sales agents across different voucher types.
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Group
      </button>
    </div>
  );
}
