import * as React from "react";
import { useRouter } from "next/router";
import {
  Store,
  Smartphone,
  DollarSign,
  CreditCard,
  Percent,
  Calendar,
  MoreHorizontal,
  ChevronDown,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { getRetailerById, getSalesByRetailerId } from "@/lib/MockData";
import { cn } from "@/utils/cn";

export default function RetailerDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    "terminals"
  );

  // Get retailer data based on ID from URL
  const retailer = React.useMemo(() => {
    if (typeof id !== "string") return null;
    return getRetailerById(id);
  }, [id]);

  // Get sales for this retailer
  const retailerSales = React.useMemo(() => {
    if (typeof id !== "string") return [];
    return getSalesByRetailerId(id);
  }, [id]);

  // If retailer not found or still loading
  if (!retailer) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <Store className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Retailer Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The retailer you are looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/admin/retailers")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Back to Retailers
          </button>
        </div>
      </div>
    );
  }

  // Format terminal data for table
  const terminalData = retailer.terminals.map((terminal) => ({
    Name: terminal.name,
    Status: (
      <div
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          terminal.status === "active"
            ? "bg-green-500/10 text-green-500"
            : "bg-amber-500/10 text-amber-500"
        )}
      >
        {terminal.status.charAt(0).toUpperCase() + terminal.status.slice(1)}
      </div>
    ),
    "Last Active": new Date(terminal.lastActive).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    Actions: (
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    ),
  }));

  // Format sales data for table
  const salesData = retailerSales.slice(0, 5).map((sale) => ({
    Date: new Date(sale.date).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    Type: sale.voucherType,
    Value: `R ${sale.voucherValue.toFixed(2)}`,
    Commission: `R ${sale.retailerCommission.toFixed(2)}`,
    "PIN/Serial": sale.pin ? `${sale.pin.slice(0, 3)}****` : "-",
  }));

  // Section toggle handler
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Retailer Details
          </h1>
          <p className="text-muted-foreground">
            View and manage retailer information.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/retailers")}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
        >
          Back to List
        </button>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary md:h-20 md:w-20">
            <Store className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold md:text-2xl">{retailer.name}</h2>
            <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Contact Person:</span>
                <span className="font-medium">{retailer.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{retailer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <div
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    retailer.status === "active"
                      ? "bg-green-500/10 text-green-500"
                      : retailer.status === "inactive"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {retailer.status.charAt(0).toUpperCase() +
                    retailer.status.slice(1)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {new Date(retailer.createdAt).toLocaleDateString("en-ZA")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="Available Balance"
          value={`R ${retailer.balance.toFixed(2)}`}
          icon={DollarSign}
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

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Terminals Section */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <button
            onClick={() => toggleSection("terminals")}
            className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Terminals</h3>
              <div className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {retailer.terminals.length}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                expandedSection === "terminals" && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === "terminals" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="border-t border-border p-4">
                  <div className="flex justify-end mb-2">
                    <button className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Terminal
                    </button>
                  </div>
                  <TablePlaceholder
                    columns={["Name", "Status", "Last Active", "Actions"]}
                    data={terminalData}
                    emptyMessage="No terminals found for this retailer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sales History Section */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <button
            onClick={() => toggleSection("sales")}
            className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Sales History</h3>
              <div className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {retailerSales.length}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                expandedSection === "sales" && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === "sales" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="border-t border-border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      Showing recent 5 of {retailerSales.length} transactions
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
      </div>
    </div>
  );
}
