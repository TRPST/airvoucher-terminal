import * as React from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft,
  Building2,
  ArrowRightLeft,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BillPaymentsGridProps {
  onOptionSelect: (option: string) => void;
  onBackToCategories: () => void;
}

export function BillPaymentsGrid({ 
  onOptionSelect, 
  onBackToCategories 
}: BillPaymentsGridProps) {
  const billPaymentOptions = [
    {
      name: "MangaungMunicipality",
      // Using a temporary icon until the actual logo is available
      icon: <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      color: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border-border"
    },
    {
      name: "Mukuru",
      // Using a temporary icon until the actual logo is available
      icon: <ArrowRightLeft className="h-10 w-10 text-green-600 dark:text-green-400" />,
      color: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40 border-border"
    },
    {
      name: "Ecocash",
      // Using a temporary icon until the actual logo is available
      icon: <Banknote className="h-10 w-10 text-purple-600 dark:text-purple-400" />,
      color: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border-border"
    },
    {
      name: "HelloPaisa",
      icon: <Banknote className="h-10 w-10 text-purple-600 dark:text-purple-400" />,
      color: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border-border"
    },
    {
      name: "DSTV",
      icon: <Banknote className="h-10 w-10 text-purple-600 dark:text-purple-400" />,
      color: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border-border"
    }
  ];
  
  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex-col sm:flex-row items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToCategories}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-bold mt-3">Bill Payments</h2>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {billPaymentOptions.map((option) => (
          <BillPaymentButton
            key={option.name}
            name={option.name}
            icon={option.icon}
            color={option.color}
            onClick={() => onOptionSelect(option.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface BillPaymentButtonProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function BillPaymentButton({ name, icon, color, onClick }: BillPaymentButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`p-4 flex flex-col items-center justify-center cursor-pointer border rounded-lg ${color} h-32 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="mb-2 h-16 w-16 flex items-center justify-center">{icon}</div>
      <span className="text-center font-medium">{name}</span>
    </motion.div>
  );
} 