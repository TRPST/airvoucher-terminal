import { Calendar, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import type { SalesHistorySectionProps } from "./types";

export function SalesHistorySection({
  sales,
  isExpanded,
  onToggle,
}: SalesHistorySectionProps) {
  // Format sales data for table
  const salesData = sales.slice(0, 5).map((sale) => ({
    Date: new Date(sale.created_at).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    Type: sale.voucher_type || "Unknown",
    Value: `R ${sale.amount.toFixed(2)}`,
    Commission: `R ${sale.retailer_commission.toFixed(2)}`,
    "PIN/Serial": "••••••••", // We don't expose PINs in the UI for security
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Sales History</h3>
          <div className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {sales.length}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-border p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground">
                  Showing recent 5 of {sales.length} transactions
                </div>
                <button className="text-sm text-primary hover:underline">
                  View All
                </button>
              </div>
              <TablePlaceholder
                columns={[
                  "Date",
                  "Type",
                  "Value",
                  "Commission",
                  "PIN/Serial",
                ]}
                data={salesData}
                emptyMessage="No sales found for this retailer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
