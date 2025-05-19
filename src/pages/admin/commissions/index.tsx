import * as React from "react";

import {
  fetchCommissionGroups,
  upsertCommissionRate,
  fetchVoucherTypes,
  createCommissionGroup,
  createCommissionRates,
  type CommissionGroup,
} from "@/actions";

import { PageHeader } from "@/components/admin/commissions/PageHeader";
import { CommissionGroupsGrid } from "@/components/admin/commissions/CommissionGroupsGrid";
import { AddCommissionDialog } from "@/components/admin/commissions/AddCommissionDialog";
import { LoadingState, ErrorState } from "@/components/admin/commissions/LoadingAndErrorStates";
import { categorizeVoucherTypes, type VoucherTypeCategory } from "@/components/admin/commissions/utils";

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


  // Loading and error states
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader onAddClick={() => setShowAddDialog(true)} />
      
      <CommissionGroupsGrid
        commissionGroups={commissionGroups}
        editGroup={editGroup}
        isSaving={isSaving}
        editedValues={editedValues}
        startEditing={startEditing}
        handleRateChange={handleRateChange}
        saveChanges={saveChanges}
        cancelEditing={cancelEditing}
      />

      <AddCommissionDialog
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        formError={formError}
        formData={formData}
        handleFormInputChange={handleFormInputChange}
        handleRateInputChange={handleRateInputChange}
        handleCreateGroup={handleCreateGroup}
        resetFormData={resetFormData}
        isCreating={isCreating}
        categorizedVoucherTypes={categorizedVoucherTypes}
      />
    </div>
  );
}
