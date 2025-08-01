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
      icon: <img src="/assets/vouchers/mangaung-logo.jpg" alt="Mangaung Municipality" className="w-full h-full object-cover rounded-lg" />,
      color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-border"
    },
    {
      name: "Mukuru",
      icon: <img src="/assets/vouchers/mukuru-logo.jpg" alt="Mukuru" className="w-full h-full object-cover rounded-lg" />,
      color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-border"
    },
    {
      name: "Ecocash",
      icon: <img src="/assets/vouchers/ecocash-logo.png" alt="Ecocash" className="w-full h-full object-cover rounded-lg" />,
      color: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-border"
    },
    {
      name: "HelloPaisa",
      icon: <img src="/assets/vouchers/hellopaisa-logo.png" alt="Hello Paisa" className="w-full h-full object-cover rounded-lg" />,
      color: "bg-green-500/5 hover:bg-green-500/10 dark:bg-green-500/10 dark:hover:bg-green-500/20"
    },
    {
      name: "DSTV",
      icon: <img src="/assets/vouchers/dstv-logo.png" alt="DSTV" className="w-full h-full object-cover rounded-lg" />,
      color: "bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/10 dark:hover:bg-blue-500/20"
    }
  ];
  
  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex-col items-center justify-between sm:flex-row">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToCategories}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="mt-3 text-xl font-bold">Bill Payments</h2>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
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

function BillPaymentButton({ name, icon, onClick, color }: BillPaymentButtonProps) {
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