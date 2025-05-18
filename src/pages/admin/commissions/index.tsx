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
  fetchVoucherTypes,
  createCommissionGroup,
  createCommissionRates,
  type CommissionGroup,
  type CommissionRate,
} from "@/actions";

// Categorized voucher types
type VoucherTypeCategory = {
  category: string;
  types: { id: string; name: string }[];
};

export default function AdminCommissions() {
  const [editGroup, setEditGroup] = React.useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [commissionGroups, setCommissionGroups] = React.useState<
    CommissionGroup[]
  >([]);
  const [voucherTypes, setVoucherTypes] = React.useState<
    {id: string; name: string}[]
  >([]);
  const [categorizedVoucherTypes, setCategorizedVoucherTypes] = React.useState<
    VoucherTypeCategory[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  
  // Form state for adding a new commission group
  const [formData, setFormData] = React.useState({
    groupName: "",
    description: "",
    rates: {} as Record<string, number>,
  });

  // Local state to track edited values
  const [editedValues, setEditedValues] = React.useState<
    Record<string, Record<string, number>>
  >({});

  // Fetch commission groups and voucher types
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Fetch commission groups
        const { data, error: fetchError } = await fetchCommissionGroups();

        if (fetchError) {
          throw new Error(
            `Failed to load commission groups: ${fetchError.message}`
          );
        }

        if (!data) {
          throw new Error("No data returned from fetchCommissionGroups");
        }

        console.log('comm groups', data);

        setCommissionGroups(data);
        
        // Fetch voucher types
        const { data: voucherTypesData, error: voucherTypesError } = await fetchVoucherTypes();
        
        if (voucherTypesError) {
          console.error("Error loading voucher types:", voucherTypesError);
          // Continue loading the page even if voucher types fail to load
        } else {
          const types = voucherTypesData || [];
          setVoucherTypes(types);
          
          // Categorize voucher types
          const categorized = categorizeVoucherTypes(types);
          setCategorizedVoucherTypes(categorized);
        }
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
      // Use voucher_type_id as the key instead of name for more reliable editing
      editValues[rate.voucher_type_id] = rate.retailer_pct * 100;
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
        const voucherTypeId = rate.voucher_type_id;
        const voucherTypeName = rate.voucher_type_name || "";

        if (edits[voucherTypeId] !== undefined) {
          const newRetailerPct = edits[voucherTypeId] / 100; // Convert back to decimal

          // Only update if the value has changed
          if (newRetailerPct !== rate.retailer_pct) {
            const { error } = await upsertCommissionRate(
              groupId,
              voucherTypeId,
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
  
  // Handle form input changes
  const handleFormInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle rate input changes in the form
  const handleRateInputChange = (voucherTypeId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    // Clamp between 0-100
    const clampedValue = Math.min(100, Math.max(0, numValue));
    
    setFormData((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [voucherTypeId]: clampedValue,
      },
    }));
  };
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      groupName: "",
      description: "",
      rates: {},
    });
    setFormError(null);
  };
  
  // Create new commission group
  const handleCreateGroup = async () => {
    // Validate form
    if (!formData.groupName.trim()) {
      setFormError("Please enter a group name");
      return;
    }
    
    setIsCreating(true);
    setFormError(null);
    
    try {
      // Step 1: Create the commission group
      const { data: groupData, error: groupError } = await createCommissionGroup(
        formData.groupName
      );
      
      if (groupError) {
        throw new Error(`Failed to create commission group: ${groupError.message}`);
      }
      
      const groupId = groupData?.id;
      if (!groupId) {
        throw new Error("Failed to get the new group ID");
      }
      
      // Step 2: Create commission rates for all voucher types
      const rates = voucherTypes.map(type => {
        // Use the rate from form data or default to 5%
        const retailerPct = (formData.rates[type.id] || 5) / 100; // Convert to decimal
        
        return {
          commission_group_id: groupId,
          voucher_type_id: type.id,
          retailer_pct: retailerPct,
          agent_pct: 0, // Default agent percentage to 0
        };
      });
      
      if (rates.length > 0) {
        const { error: ratesError } = await createCommissionRates(rates);
        
        if (ratesError) {
          throw new Error(`Failed to create commission rates: ${ratesError.message}`);
        }
      }
      
      // Step 3: Refresh the commission groups list
      const { data: refreshedData } = await fetchCommissionGroups();
      if (refreshedData) {
        setCommissionGroups(refreshedData);
      }
      
      // Step 4: Close dialog and reset form
      setShowAddDialog(false);
      resetFormData();
      
    } catch (err) {
      console.error("Error creating commission group:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to create commission group"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Categorize voucher types into groups
  const categorizeVoucherTypes = (types: { id: string; name: string }[]): VoucherTypeCategory[] => {
    // Mobile network providers
    const mobileNetworks = types.filter(type => 
      ['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
        network => type.name.includes(network)
      )
    );
    
    // Other types (those not in mobile networks)
    const otherTypes = types.filter(type => 
      !['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
        network => type.name.includes(network)
      )
    );
    
    const categories: VoucherTypeCategory[] = [];
    
    // Add mobile networks category if there are any
    if (mobileNetworks.length > 0) {
      categories.push({
        category: 'Mobile Networks',
        types: mobileNetworks
      });
    }
    
    // Add others as a category
    if (otherTypes.length > 0) {
      categories.push({
        category: 'Other Services',
        types: otherTypes
      });
    }
    
    return categories;
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
              <div className="space-y-4">
                {(() => {
                  // Categorize rates for this group
                  const mobileRates = group.rates.filter(rate => 
                    ['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
                      network => (rate.voucher_type_name || '').includes(network)
                    )
                  );
                  
                  const otherRates = group.rates.filter(rate => 
                    !['Vodacom', 'MTN', 'CellC', 'Telkom'].some(
                      network => (rate.voucher_type_name || '').includes(network)
                    )
                  );
                  
                  const categories = [];
                  if (mobileRates.length > 0) {
                    categories.push({ name: 'Mobile Networks', rates: mobileRates });
                  }
                  if (otherRates.length > 0) {
                    categories.push({ name: 'Other Services', rates: otherRates });
                  }
                  
                  return categories.map(category => (
                    <div key={category.name} className="space-y-2">
                      <h3 className="text-xs font-medium uppercase text-muted-foreground border-b pb-1">
                        {category.name}
                      </h3>
                      <div className="space-y-3">
                        {category.rates.map((rate) => (
                          <div
                            key={rate.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Percent className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-sm">
                                {rate.voucher_type_name || `Type: ${rate.voucher_type_id.substring(0, 6)}`}
                              </span>
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
                                      rate.voucher_type_id
                                    ] || 0
                                  }
                                  onChange={(e) =>
                                    handleRateChange(
                                      group.id,
                                      rate.voucher_type_id,
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
                      </div>
                    </div>
                  ));
                })()}

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
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
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
              {formError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {formError}
                  </div>
                </div>
              )}
            
              <div className="space-y-1">
                <label className="text-sm font-medium">Group Name</label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleFormInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g., Premium, Standard, etc."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleFormInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Brief description of this group"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Commission Rates</label>
                
                {categorizedVoucherTypes.length > 0 ? (
                  categorizedVoucherTypes.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <h3 className="text-xs font-medium uppercase text-muted-foreground border-b pb-1">
                        {category.category}
                      </h3>
                      <div className="space-y-3">
                        {category.types.map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{type.name}</span>
                            <div className="relative w-24">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={formData.rates[type.id] || 5}
                                onChange={(e) => handleRateInputChange(type.id, e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-1 text-right text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                                %
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Loading voucher types...
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddDialog(false);
                    resetFormData();
                  }}
                  type="button"
                  className="rounded-md px-4 py-2 text-sm font-medium border border-input hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  type="button"
                  disabled={isCreating}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
