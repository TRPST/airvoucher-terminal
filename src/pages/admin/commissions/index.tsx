import * as React from "react";
import {
  Plus,
  Pencil,
  Percent,
  XCircle,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/utils/cn";
import {
  fetchCommissionGroups,
  upsertCommissionRate,
  type CommissionGroup,
  type CommissionRate,
} from "@/actions";

export default function AdminCommissions() {
  const [editGroup, setEditGroup] = React.useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [commissionGroups, setCommissionGroups] = React.useState<
    CommissionGroup[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Local state to track edited values
  const [editedValues, setEditedValues] = React.useState<
    Record<string, Record<string, number>>
  >({});

  // Fetch commission groups
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const { data, error: fetchError } = await fetchCommissionGroups();

        if (fetchError) {
          throw new Error(
            `Failed to load commission groups: ${fetchError.message}`
          );
        }

        setCommissionGroups(data || []);
      } catch (err) {
        console.error("Error loading commission data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load commission groups"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Initialize edit values when starting to edit
  const startEditing = (groupId: string) => {
    const group = commissionGroups.find((g) => g.id === groupId);
    if (!group) return;

    // Convert the rates to a more convenient format for editing
    const editValues: Record<string, number> = {};

    group.rates.forEach((rate) => {
      editValues[rate.voucher_type_name || ""] = rate.retailer_pct * 100;
    });

    setEditedValues((prev) => ({
      ...prev,
      [groupId]: editValues,
    }));

    setEditGroup(groupId);
  };

  // Handle rate change
  const handleRateChange = (
    groupId: string,
    voucherType: string,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setEditedValues((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [voucherType]: Math.min(100, Math.max(0, numValue)), // Clamp between 0-100
      },
    }));
  };

  // Save changes for a group
  const saveChanges = async (groupId: string) => {
    try {
      setIsSaving(true);

      const group = commissionGroups.find((g) => g.id === groupId);
      if (!group) return;

      const edits = editedValues[groupId];

      // Save each rate
      for (const rate of group.rates) {
        const voucherTypeName = rate.voucher_type_name || "";

        if (edits[voucherTypeName] !== undefined) {
          const newRetailerPct = edits[voucherTypeName] / 100; // Convert back to decimal

          // Only update if the value has changed
          if (newRetailerPct !== rate.retailer_pct) {
            const { error } = await upsertCommissionRate(
              groupId,
              rate.voucher_type_id,
              newRetailerPct,
              rate.agent_pct // Keep agent percent the same
            );

            if (error) {
              console.error(
                `Error updating rate for ${voucherTypeName}:`,
                error
              );
              // Continue with other updates
            }
          }
        }
      }

      // Refresh commission groups
      const { data: refreshedData } = await fetchCommissionGroups();
      if (refreshedData) {
        setCommissionGroups(refreshedData);
      }

      // Reset edit state
      setEditGroup(null);
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[groupId];
        return newValues;
      });
    } catch (err) {
      console.error("Error saving commission rates:", err);
      // Show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const cancelEditing = (groupId: string) => {
    setEditGroup(null);

    // Remove the edit values for this group
    setEditedValues((prev) => {
      const newValues = { ...prev };
      delete newValues[groupId];
      return newValues;
    });
  };

  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading commission groups...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Commission Groups
          </h1>
          <p className="text-muted-foreground">
            Manage commission rates for different retailer groups.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {commissionGroups.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">{group.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {group.name === "Premium"
                    ? "Higher commission rates for top performers"
                    : group.name === "Standard"
                    ? "Default commission rates for most retailers"
                    : "Basic commission rates for new retailers"}
                </p>
              </div>
              {editGroup === group.id ? (
                <div className="flex space-x-1">
                  <button
                    onClick={() => saveChanges(group.id)}
                    disabled={isSaving}
                    className="rounded-full p-1.5 text-green-500 hover:bg-green-500/10 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => cancelEditing(group.id)}
                    disabled={isSaving}
                    className="rounded-full p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing(group.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center border-b border-border pb-2 text-sm font-medium">
                <span className="flex-1">Voucher Type</span>
                <span className="w-24 text-right">Commission Rate</span>
              </div>
              <div className="space-y-3">
                {group.rates.map((rate) => (
                  <div
                    key={rate.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Percent className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm">{rate.voucher_type_name}</span>
                    </div>

                    {/* Edit mode */}
                    {editGroup === group.id ? (
                      <div className="relative w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={
                            editedValues[group.id]?.[
                              rate.voucher_type_name || ""
                            ] || 0
                          }
                          onChange={(e) =>
                            handleRateChange(
                              group.id,
                              rate.voucher_type_name || "",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-right text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                          %
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "rounded-md px-2 py-1 text-right text-sm",
                          rate.retailer_pct > 0.02
                            ? "text-green-500"
                            : "text-amber-500"
                        )}
                      >
                        {formatPercentage(rate.retailer_pct * 100)}
                      </div>
                    )}
                  </div>
                ))}

                {group.rates.length === 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No commission rates defined for this group
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {commissionGroups.length === 0 && (
          <div className="col-span-full rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No commission groups found. Create your first group to get
              started.
            </p>
          </div>
        )}
      </div>

      {/* Add Commission Group Dialog */}
      {showAddDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Commission Group</h2>
              <button
                onClick={() => setShowAddDialog(false)}
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
              <div className="space-y-1">
                <label className="text-sm font-medium">Group Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Premium, Standard, etc."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description of this group"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Commission Rates</label>
                {["Mobile", "OTT", "Hollywoodbets", "Ringa", "EasyLoad"].map(
                  (type) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{type}</span>
                      <div className="relative w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          defaultValue="5.00"
                          className="w-full rounded-md border border-input bg-background px-3 py-1 text-right text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                          %
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium border border-input hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
