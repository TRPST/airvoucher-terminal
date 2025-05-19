import * as React from "react";
import {
  Upload,
  Plus,
  CreditCard,
  Search,
  Filter,
  ArrowDown,
  ArrowUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import { fetchVoucherInventory, type VoucherInventory } from "@/actions";
import { VoucherUploadDialog } from "@/components/admin/vouchers/VoucherUploadDialog";

export default function AdminVouchers() {
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "voucher_type_name",
    direction: "asc",
  });
  const [vouchers, setVouchers] = React.useState<VoucherInventory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch voucher inventory
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await fetchVoucherInventory();

        if (fetchError) {
          throw new Error(
            `Failed to load voucher inventory: ${fetchError.message}`
          );
        }

        setVouchers(data || []);
        console.log('vouchers', data);
      } catch (err) {
        console.error("Error loading voucher data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load voucher inventory"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Group vouchers by type for better inventory overview
  const groupedVouchers = React.useMemo(() => {
    const groups = new Map<
      string,
      {
        type: string;
        voucherTypeName: string;
        count: number;
        available: number;
        sold: number;
        disabled: number;
        amount: number;
      }
    >();

    vouchers.forEach((voucher) => {
      const key = voucher.voucher_type_name;
      const current = groups.get(key) || {
        type: key, // Use the actual voucher type name directly
        voucherTypeName: key,
        count: 0,
        available: 0,
        sold: 0,
        disabled: 0,
        amount: voucher.amount,
      };

      current.count++;

      if (voucher.status === "available") {
        current.available++;
      } else if (voucher.status === "sold") {
        current.sold++;
      } else if (voucher.status === "disabled") {
        current.disabled++;
      }

      groups.set(key, current);
    });

    return Array.from(groups.values());
  }, [vouchers]);

  // Filter and sort vouchers
  const filteredVouchers = React.useMemo(() => {
    let filtered = [...groupedVouchers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((voucher) =>
        voucher.type.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const field = sortBy.field as keyof typeof a;

      // For inventory value, calculate dynamically
      if (sortBy.field === "inventoryValue") {
        const aValue = a.available * a.amount;
        const bValue = b.available * b.amount;
        return sortBy.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

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
  }, [groupedVouchers, searchTerm, sortBy]);

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
    (sum, voucher) => sum + voucher.amount * voucher.available,
    0
  );

  // Format data for table
  const tableData = filteredVouchers.map((voucher) => {
    const stockStatus =
      voucher.available < 10
        ? "Low"
        : voucher.available < 50
        ? "Medium"
        : "High";

    return {
      Type: (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{voucher.type}</div>
            <div className="text-xs text-muted-foreground">R {voucher.amount.toFixed(2)}</div>
          </div>
        </div>
      ),
      Value: `R ${voucher.amount.toFixed(2)}`,
      Available: (
        <div className="flex items-center gap-2">
          <span>{voucher.available.toLocaleString()}</span>
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
      Disabled: voucher.disabled.toLocaleString(),
      "Inventory Value": `R ${(voucher.amount * voucher.available).toFixed(2)}`,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading voucher inventory...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Error</h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
        onClick={() => toggleSort("amount")}
      >
        <div className="flex items-center">
          Value <SortIndicator field="amount" />
        </div>
      </th>
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("available")}
      >
        <div className="flex items-center">
          Available <SortIndicator field="available" />
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
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("disabled")}
      >
        <div className="flex items-center">
          Disabled <SortIndicator field="disabled" />
        </div>
      </th>
      <th
        className="whitespace-nowrap px-4 py-3 cursor-pointer"
        onClick={() => toggleSort("inventoryValue")}
      >
        <div className="flex items-center">
          Inventory Value <SortIndicator field="inventoryValue" />
        </div>
      </th>
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

      {/* Inventory Summary */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <h2 className="text-xl font-semibold">
                {vouchers
                  .filter((v) => v.status === "available")
                  .length.toLocaleString()}{" "}
                Available
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Total inventory value:{" "}
              <span className="font-semibold">
                R {totalInventoryValue.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium">
                  {vouchers
                    .filter((v) => v.status === "sold")
                    .length.toLocaleString()}{" "}
                  Sold
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Used vouchers</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="font-medium">
                  {vouchers
                    .filter((v) => v.status === "disabled")
                    .length.toLocaleString()}{" "}
                  Disabled
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Inactive vouchers</p>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Table */}
      <div className="rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>{columnHeaders}</thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} className="p-4 whitespace-nowrap">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground whitespace-nowrap"
                  >
                    No vouchers found. Try adjusting your search or upload new
                    vouchers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Upload Dialog */}
      <VoucherUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={() => {
          // Reload data after successful upload
          setShowUploadDialog(false);
          setIsLoading(true);
          fetchVoucherInventory()
            .then(({ data, error: fetchError }) => {
              if (fetchError) {
                throw new Error(`Failed to reload voucher inventory: ${fetchError.message}`);
              }
              setVouchers(data || []);
            })
            .catch((err) => {
              console.error("Error reloading voucher data:", err);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }}
      />
    </div>
  );
}
