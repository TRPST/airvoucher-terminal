import * as React from "react";
import {
  Upload,
  Plus,
  CreditCard,
  Search,
  Filter,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { vouchers } from "@/lib/MockData";
import { cn } from "@/utils/cn";

export default function AdminVouchers() {
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "provider",
    direction: "asc",
  });

  // Filter and sort vouchers
  const filteredVouchers = React.useMemo(() => {
    let filtered = [...vouchers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (voucher) =>
          voucher.provider.toLowerCase().includes(term) ||
          voucher.type.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const field = sortBy.field as keyof typeof a;

      // Handle string comparison
      if (typeof a[field] === "string" && typeof b[field] === "string") {
        return sortBy.direction === "asc"
          ? (a[field] as string).localeCompare(b[field] as string)
          : (b[field] as string).localeCompare(a[field] as string);
      }

      // Handle number comparison
      if (typeof a[field] === "number" && typeof b[field] === "number") {
        return sortBy.direction === "asc"
          ? (a[field] as number) - (b[field] as number)
          : (b[field] as number) - (a[field] as number);
      }

      return 0;
    });

    return filtered;
  }, [vouchers, searchTerm, sortBy]);

  // Toggle sort direction for a column
  const toggleSort = (field: string) => {
    if (sortBy.field === field) {
      setSortBy({
        field,
        direction: sortBy.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortBy({ field, direction: "asc" });
    }
  };

  // Calculate total inventory value
  const totalInventoryValue = filteredVouchers.reduce(
    (sum, voucher) => sum + voucher.value * voucher.stock,
    0
  );

  // Format data for table
  const tableData = filteredVouchers.map((voucher) => {
    const stockStatus =
      voucher.stock < 100 ? "Low" : voucher.stock < 500 ? "Medium" : "High";

    return {
      Type: (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{voucher.type}</div>
            <div className="text-xs text-muted-foreground">
              {voucher.provider}
            </div>
          </div>
        </div>
      ),
      Value: `R ${voucher.value.toFixed(2)}`,
      Cost: `R ${voucher.cost.toFixed(2)}`,
      Stock: (
        <div className="flex items-center gap-2">
          <span>{voucher.stock.toLocaleString()}</span>
          <div
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              stockStatus === "Low"
                ? "bg-destructive/10 text-destructive"
                : stockStatus === "Medium"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-green-500/10 text-green-500"
            )}
          >
            {stockStatus}
          </div>
        </div>
      ),
      Sold: voucher.sold.toLocaleString(),
      "Inventory Value": `R ${(voucher.value * voucher.stock).toFixed(2)}`,
    };
  });

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortBy.field !== field) {
      return null;
    }
    return sortBy.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  // Custom column headers with sorting
  const columnHeaders = (
    <tr className="border-b border-border">
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("type")}
      >
        <div className="flex items-center">
          Type <SortIndicator field="type" />
        </div>
      </th>
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("value")}
      >
        <div className="flex items-center">
          Value <SortIndicator field="value" />
        </div>
      </th>
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("cost")}
      >
        <div className="flex items-center">
          Cost <SortIndicator field="cost" />
        </div>
      </th>
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("stock")}
      >
        <div className="flex items-center">
          Stock <SortIndicator field="stock" />
        </div>
      </th>
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("sold")}
      >
        <div className="flex items-center">
          Sold <SortIndicator field="sold" />
        </div>
      </th>
      <th className="whitespace-nowrap px-4 py-3">Inventory Value</th>
    </tr>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Voucher Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage voucher stock and upload new vouchers.
          </p>
        </div>
        <button
          onClick={() => setShowUploadDialog(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Vouchers
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm">
            <p className="font-medium">Total Inventory Value</p>
            <p className="text-xl font-bold text-primary">
              R{" "}
              {totalInventoryValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {filteredVouchers.length} voucher types in stock
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search vouchers..."
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
      </div>

      <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-card text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {columnHeaders}
          </thead>
          <tbody className="divide-y divide-border">
            {tableData.map((row, index) => (
              <tr
                key={`row-${index}`}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                {Object.entries(row).map(([key, value], colIndex) => (
                  <td
                    key={`cell-${index}-${colIndex}`}
                    className="px-4 py-3 text-sm"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Vouchers Dialog */}
      {showUploadDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowUploadDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Vouchers</h2>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="rounded-full p-2 hover:bg-muted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-2 text-sm font-medium">
                  Drag and drop CSV file here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Or click to browse files (Max file size: 10MB)
                </p>
                <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Browse Files
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Voucher Type</h3>
                <div className="flex flex-wrap gap-2">
                  {["Mobile", "OTT", "Hollywoodbets", "Ringa", "EasyLoad"].map(
                    (type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5"
                          defaultChecked
                        />
                        <span>{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Providers</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Vodacom",
                    "MTN",
                    "Telkom",
                    "Cell C",
                    "Netflix",
                    "Showmax",
                    "DSTV",
                  ].map((provider) => (
                    <label
                      key={provider}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5"
                        defaultChecked
                      />
                      <span>{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium border border-input hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow"
                >
                  Upload &amp; Replace All
                </button>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Upload &amp; Merge
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
