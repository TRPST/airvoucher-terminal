import * as React from "react";
import { Calendar, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { retailers, sales } from "@/lib/MockData";
import { cn } from "@/utils/cn";

// Define tab types for date filtering
type DateFilter = "today" | "week" | "month" | "all";

export default function RetailerHistory() {
  // Get the first active retailer for demo purposes
  const retailer = retailers.find((r) => r.status === "active") || retailers[0];

  const [activeTab, setActiveTab] = React.useState<DateFilter>("week");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Get filtered sales
  const filteredSales = React.useMemo(() => {
    // Get sales for this retailer
    let retailerSales = sales.filter((sale) => sale.retailerId === retailer.id);

    // Apply date filter
    const now = new Date();
    if (activeTab === "today") {
      const today = now.toISOString().split("T")[0];
      retailerSales = retailerSales.filter((sale) =>
        sale.date.startsWith(today)
      );
    } else if (activeTab === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      retailerSales = retailerSales.filter(
        (sale) => new Date(sale.date) >= oneWeekAgo
      );
    } else if (activeTab === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      retailerSales = retailerSales.filter(
        (sale) => new Date(sale.date) >= oneMonthAgo
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      retailerSales = retailerSales.filter(
        (sale) =>
          sale.voucherType.toLowerCase().includes(term) ||
          (sale.pin && sale.pin.includes(term)) ||
          (sale.serialNumber && sale.serialNumber.includes(term))
      );
    }

    return retailerSales;
  }, [retailer.id, activeTab, searchTerm]);

  // Format table data
  const tableData = filteredSales.map((sale) => ({
    Date: new Date(sale.date).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    Type: (
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            sale.voucherType === "Mobile"
              ? "bg-blue-500"
              : sale.voucherType === "OTT"
              ? "bg-purple-500"
              : sale.voucherType === "Hollywoodbets"
              ? "bg-green-500"
              : sale.voucherType === "Ringa"
              ? "bg-amber-500"
              : "bg-pink-500"
          )}
        />
        <span>{sale.voucherType}</span>
      </div>
    ),
    Value: `R ${sale.voucherValue.toFixed(2)}`,
    Commission: `R ${sale.retailerCommission.toFixed(2)}`,
    "PIN/Serial": sale.pin
      ? `${sale.pin.slice(0, 3)}****`
      : sale.serialNumber
      ? `${sale.serialNumber.slice(0, 3)}****`
      : "-",
  }));

  // Date filter tabs
  const tabs = [
    { id: "today", label: "Today" },
    { id: "week", label: "Last 7 Days" },
    { id: "month", label: "Last 30 Days" },
    { id: "all", label: "All Time" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Sales History
        </h1>
        <p className="text-muted-foreground">
          View your sales history and transaction details.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Date Filter Tabs */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DateFilter)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search transactions..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-muted">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Transactions Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
              <p className="text-2xl font-semibold">{filteredSales.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
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
                className="h-5 w-5"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-semibold">
                R{" "}
                {filteredSales
                  .reduce((sum, sale) => sum + sale.voucherValue, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
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
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m8 12 3 3 5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earned Commission</p>
              <p className="text-2xl font-semibold">
                R{" "}
                {filteredSales
                  .reduce((sum, sale) => sum + sale.retailerCommission, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      {filteredSales.length > 0 ? (
        <div className="rounded-lg border border-border shadow-sm">
          <TablePlaceholder
            columns={["Date", "Type", "Value", "Commission", "PIN/Serial"]}
            data={tableData}
          />
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-3 rounded-full bg-muted p-3">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No transactions found</h3>
          <p className="mb-4 text-muted-foreground">
            {activeTab === "today"
              ? "You haven't made any sales today."
              : activeTab === "week"
              ? "No sales in the last 7 days."
              : activeTab === "month"
              ? "No sales in the last 30 days."
              : "Your transaction history is empty."}
          </p>
        </div>
      )}
    </div>
  );
}
