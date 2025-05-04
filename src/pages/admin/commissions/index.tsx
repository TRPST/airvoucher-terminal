import * as React from "react";
import { Plus, Pencil, Percent, XCircle, Check } from "lucide-react";
import { motion } from "framer-motion";

import { commissionGroups } from "@/lib/MockData";
import { cn } from "@/utils/cn";

export default function AdminCommissions() {
  const [editGroup, setEditGroup] = React.useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  // Local state to track edited values
  const [editedValues, setEditedValues] = React.useState<
    Record<string, Record<string, number>>
  >({});

  // Initialize edit values when starting to edit
  const startEditing = (groupId: string) => {
    const group = commissionGroups.find((g) => g.id === groupId);
    if (!group) return;

    setEditedValues((prev) => ({
      ...prev,
      [groupId]: {
        Mobile: group.mobileRate * 100,
        OTT: group.ottRate * 100,
        Hollywoodbets: group.hollywoodbetsRate * 100,
        Ringa: group.ringaRate * 100,
        EasyLoad: group.easyloadRate * 100,
      },
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
  const saveChanges = (groupId: string) => {
    // In a real app, we would save to the database here
    setEditGroup(null);
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
                    className="rounded-full p-1.5 text-green-500 hover:bg-green-500/10"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => cancelEditing(group.id)}
                    className="rounded-full p-1.5 text-destructive hover:bg-destructive/10"
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
                {[
                  { type: "Mobile", rate: group.mobileRate * 100 },
                  { type: "OTT", rate: group.ottRate * 100 },
                  {
                    type: "Hollywoodbets",
                    rate: group.hollywoodbetsRate * 100,
                  },
                  { type: "Ringa", rate: group.ringaRate * 100 },
                  { type: "EasyLoad", rate: group.easyloadRate * 100 },
                ].map(({ type, rate }) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Percent className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm">{type}</span>
                    </div>

                    {/* Edit mode */}
                    {editGroup === group.id ? (
                      <div className="relative w-20">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={editedValues[group.id]?.[type] || 0}
                          onChange={(e) =>
                            handleRateChange(group.id, type, e.target.value)
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
                          rate > 2 ? "text-green-500" : "text-amber-500"
                        )}
                      >
                        {formatPercentage(rate)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
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
