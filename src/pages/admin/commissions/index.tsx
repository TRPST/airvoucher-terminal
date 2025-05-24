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
    rates: {} as Record<string, {retailerPct: number, agentPct: number}>,
  });

  // Local state to track edited values
  const [editedValues, setEditedValues] = React.useState<
    Record<string, Record<string, {retailerPct: number, agentPct: number}>>
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
    const editValues: Record<string, {retailerPct: number, agentPct: number}> = {};

    group.rates.forEach((rate) => {
      // Use voucher_type_id as the key instead of name for more reliable editing
      editValues[rate.voucher_type_id] = {
        retailerPct: rate.retailer_pct * 100,
        agentPct: rate.agent_pct * 100
      };
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
    value: string,
    rateType: 'retailer' | 'agent'
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const clampedValue = Math.min(100, Math.max(0, numValue)); // Clamp between 0-100

    setEditedValues((prev) => {
      const currentValues = prev[groupId]?.[voucherType] || { retailerPct: 0, agentPct: 0 };
      
      return {
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [voucherType]: {
            ...currentValues,
            [rateType === 'retailer' ? 'retailerPct' : 'agentPct']: clampedValue
          }
        }
      };
    });
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
          const newRetailerPct = edits[voucherTypeId].retailerPct / 100; // Convert back to decimal
          const newAgentPct = edits[voucherTypeId].agentPct / 100; // Convert back to decimal

          // Only update if either value has changed
          if (newRetailerPct !== rate.retailer_pct || newAgentPct !== rate.agent_pct) {
            const { error } = await upsertCommissionRate(
              groupId,
              voucherTypeId,
              newRetailerPct,
              newAgentPct
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
  const handleRateInputChange = (voucherTypeId: string, value: string, rateType: 'retailer' | 'agent') => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    // Clamp between 0-100
    const clampedValue = Math.min(100, Math.max(0, numValue));
    
    setFormData((prev) => {
      // Get existing rates for this voucher type or initialize defaults
      const existingRates = prev.rates[voucherTypeId] || { retailerPct: 5, agentPct: 0 };
      
      return {
        ...prev,
        rates: {
          ...prev.rates,
          [voucherTypeId]: {
            ...existingRates,
            [rateType === 'retailer' ? 'retailerPct' : 'agentPct']: clampedValue
          },
        },
      };
    });
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
        formData.groupName,
        formData.description
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
        // Get rates from form data or use defaults
        const rateData = formData.rates[type.id] || { retailerPct: 5, agentPct: 0 };
        
        // Convert to decimal
        const retailerPct = rateData.retailerPct / 100;
        const agentPct = rateData.agentPct / 100;
        
        return {
          commission_group_id: groupId,
          voucher_type_id: type.id,
          retailer_pct: retailerPct,
          agent_pct: agentPct,
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
        voucherTypes={voucherTypes}
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
