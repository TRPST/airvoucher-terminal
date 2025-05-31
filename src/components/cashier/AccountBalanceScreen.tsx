import * as React from "react";
import { 
  ChevronLeft, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface AccountBalanceScreenProps {
  retailerName: string;
  terminalName: string;
  retailerBalance: number;
  retailerCreditLimit: number;
  retailerCreditUsed: number;
  terminalCommission: number;
  onBackToAdmin: () => void;
}

export function AccountBalanceScreen({
  retailerName,
  terminalName,
  retailerBalance,
  retailerCreditLimit,
  retailerCreditUsed,
  terminalCommission,
  onBackToAdmin
}: AccountBalanceScreenProps) {
  // Calculate available credit
  const availableCredit = retailerCreditLimit - retailerCreditUsed;
  
  // Calculate credit utilization percentage
  const creditUtilizationPercentage = retailerCreditLimit > 0 
    ? Math.round((retailerCreditUsed / retailerCreditLimit) * 100) 
    : 0;
  
  // Determine if credit is running low (over 80% utilized)
  const isCreditLow = creditUtilizationPercentage > 80;

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToAdmin}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-bold">Account Balance</h2>
        <div className="w-20"></div> {/* Spacer for alignment */}
      </div>

      <div>
        <p className="text-muted-foreground">
          Financial summary for <span className="font-medium">{retailerName}</span>
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold">R {retailerBalance.toFixed(2)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Balance available for purchasing vouchers
          </p>
        </motion.div>

        {/* Available Credit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              isCreditLow 
                ? "bg-amber-500/10 text-amber-500" 
                : "bg-blue-500/10 text-blue-500"
            )}>
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Credit</p>
              <p className="text-3xl font-bold">R {availableCredit.toFixed(2)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {isCreditLow 
              ? <span className="flex items-center text-amber-500"><AlertTriangle className="mr-1 h-4 w-4" /> Credit is running low</span>
              : "Credit available for purchases"}
          </p>
        </motion.div>
      </div>

      {/* Credit Details */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium">Credit Details</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Credit Limit</p>
            <p className="font-medium">R {retailerCreditLimit.toFixed(2)}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Credit Used</p>
            <p className="font-medium">R {retailerCreditUsed.toFixed(2)}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Credit Utilisation</p>
            <p className={cn(
              "font-medium",
              creditUtilizationPercentage > 90 ? "text-red-500" :
              creditUtilizationPercentage > 75 ? "text-amber-500" :
              "text-green-500"
            )}>
              {creditUtilizationPercentage}%
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2">
            <div className="h-2 w-full rounded-full bg-muted">
              <div 
                className={cn(
                  "h-2 rounded-full",
                  creditUtilizationPercentage > 90 ? "bg-red-500" :
                  creditUtilizationPercentage > 75 ? "bg-amber-500" :
                  "bg-green-500"
                )}
                style={{ width: `${creditUtilizationPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Commission Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Terminal Commissions</p>
            <p className="text-3xl font-bold">R {terminalCommission.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 