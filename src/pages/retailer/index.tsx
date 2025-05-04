import * as React from "react";
import { Wallet, CreditCard, Percent, Tags } from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { ConfettiOverlay } from "@/components/ConfettiOverlay";
import { retailers, vouchers } from "@/lib/MockData";
import { cn } from "@/utils/cn";

type VoucherCategoryProps = {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
};

const VoucherCategory = ({
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

export default function RetailerPOS() {
  // Get the first active retailer for demo purposes
  const retailer = retailers.find((r) => r.status === "active") || retailers[0];

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [saleComplete, setSaleComplete] = React.useState(false);

  // Voucher categories with their display properties
  const voucherCategories = [
    {
      name: "Mobile",
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-blue-500/5 hover:bg-blue-500/10",
    },
    {
      name: "OTT",
      icon: <Tags className="h-6 w-6" />,
      color: "bg-purple-500/5 hover:bg-purple-500/10",
    },
    {
      name: "Hollywoodbets",
      icon: <Wallet className="h-6 w-6" />,
      color: "bg-green-500/5 hover:bg-green-500/10",
    },
    {
      name: "Ringa",
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-amber-500/5 hover:bg-amber-500/10",
    },
    {
      name: "EasyLoad",
      icon: <Wallet className="h-6 w-6" />,
      color: "bg-pink-500/5 hover:bg-pink-500/10",
    },
  ];

  // Get vouchers for a specific category
  const getVouchersForCategory = (category: string) => {
    return vouchers.filter(
      (voucher) => voucher.type === category && voucher.stock > 0
    );
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedValue(null);
  };

  // Handle voucher value selection
  const handleValueSelect = (value: number) => {
    setSelectedValue(value);
    setShowConfirmDialog(true);
  };

  // Handle sale confirmation
  const handleConfirmSale = () => {
    // In a real app, we would process the sale here
    setShowConfirmDialog(false);

    // Show confetti and toast for visual feedback
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    setSaleComplete(true);
    setShowToast(true);

    // Reset after a delay
    setTimeout(() => {
      setSelectedCategory(null);
      setSelectedValue(null);
      setSaleComplete(false);
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Confetti effect on successful sale */}
      {showConfetti && <ConfettiOverlay />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Sell Vouchers
        </h1>
        <p className="text-muted-foreground">
          Select a voucher category and value to make a sale.
        </p>
      </div>

      {/* Balance Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="Available Balance"
          value={`R ${retailer.balance.toFixed(2)}`}
          icon={Wallet}
          intent="success"
          subtitle="Current account balance"
        />
        <StatsTile
          label="Credit Used"
          value={`R ${retailer.credit.toFixed(2)}`}
          icon={CreditCard}
          intent="warning"
          subtitle="Active credit amount"
        />
        <StatsTile
          label="Commission Earned"
          value={`R ${retailer.commission.toFixed(2)}`}
          icon={Percent}
          intent="info"
          subtitle="Total earned to date"
        />
      </div>

      {/* Voucher Categories Grid */}
      {!selectedCategory ? (
        <div>
          <h2 className="mb-4 text-lg font-medium">Select Voucher Type</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {voucherCategories.map((category) => (
              <VoucherCategory
                key={category.name}
                name={category.name}
                icon={category.icon}
                color={category.color}
                onClick={() => handleCategorySelect(category.name)}
              />
            ))}
          </div>
        </div>
      ) : (
        // Voucher Values Grid
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Select {selectedCategory} Voucher Value
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
            >
              ← Back to Categories
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {getVouchersForCategory(selectedCategory).map((voucher) => (
              <motion.button
                key={voucher.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleValueSelect(voucher.value)}
                className="flex flex-col items-center justify-center rounded-lg border border-border p-6 text-center shadow-sm hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-2 text-sm text-muted-foreground">
                  {voucher.provider}
                </div>
                <div className="text-2xl font-bold">
                  R {voucher.value.toFixed(2)}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Sale Dialog */}
      {showConfirmDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <h2 className="mb-1 text-xl font-semibold">Confirm Sale</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                You're about to sell the following voucher:
              </p>

              <div className="mb-6 w-full rounded-lg bg-muted p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedCategory}</span>
                </div>
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="font-medium">
                    R {selectedValue?.toFixed(2)}
                  </span>
                </div>
                {selectedCategory === "Mobile" && (
                  <div className="flex justify-between border-t border-border py-2">
                    <span className="text-sm text-muted-foreground">
                      Provider:
                    </span>
                    <span className="font-medium">
                      {getVouchersForCategory(selectedCategory)[0]?.provider}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border py-2">
                  <span className="text-sm text-muted-foreground">
                    Commission:
                  </span>
                  <span className="font-medium text-green-500">
                    R {((selectedValue || 0) * 0.02).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSale}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in-20 max-w-md rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-500 shadow-lg">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-5 w-5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <h4 className="font-medium">Sale Successful!</h4>
              <p className="text-sm">
                {selectedCategory} voucher for R {selectedValue?.toFixed(2)}{" "}
                sold successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
