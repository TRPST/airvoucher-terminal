import * as React from "react";
import { motion } from "framer-motion";
import { 
  History, 
  Wallet, 
  Printer, 
  DollarSign, 
  Building,
  ChevronLeft,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminOptionsGridProps {
  onOptionSelect: (option: string) => void;
  onBackToCategories: () => void;
}

export function AdminOptionsGrid({ 
  onOptionSelect, 
  onBackToCategories 
}: AdminOptionsGridProps) {
  const adminOptions = [
    {
      name: "Sales History",
      icon: <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      color: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border-border"
    },
    {
      name: "Account Balance",
      icon: <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />,
      color: "bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-900/40 border-border"
    },
    {
      name: "Reprint Last Slip",
      icon: <Printer className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
      color: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border-border"
    },
    {
      name: "Profit Claim",
      icon: <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
      color: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border-border"
    },
    {
      name: "Banking Details",
      icon: <Building className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      color: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border-border"
    },
    {
      name: "Outlet to Outlet Transfer",
      icon: <ArrowRightLeft className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      color: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border-border"
    }
  ];
  
  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToCategories}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-bold">Admin Options</h2>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>
      
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {adminOptions.map((option) => (
          <AdminOptionButton
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

interface AdminOptionButtonProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function AdminOptionButton({ name, icon, color, onClick }: AdminOptionButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`p-4 flex flex-col items-center justify-center cursor-pointer border rounded-lg ${color} h-32 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-center font-medium">{name}</span>
    </motion.div>
  );
} 