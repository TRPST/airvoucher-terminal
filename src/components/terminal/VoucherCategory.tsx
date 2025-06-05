import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export type VoucherCategoryProps = {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
};

export const VoucherCategory = ({
  name,
  icon,
  color,
  onClick,
}: VoucherCategoryProps) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center rounded-lg border border-border p-4 text-center shadow-sm transition-colors",
      "sm:p-6",
      "hover:border-primary/20 hover:shadow-md",
      color
    )}
  >
    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <span className="font-medium">{name}</span>
  </motion.button>
);
