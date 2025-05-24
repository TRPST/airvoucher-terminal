import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { fetchCommissionGroups, updateRetailer, type CommissionGroup } from "@/actions";
import type { CommissionGroupModalProps } from "./types";

export function CommissionGroupModal({ 
  isOpen, 
  onClose, 
  retailer, 
  onUpdate 
}: CommissionGroupModalProps) {
  const [commissionGroups, setCommissionGroups] = useState<CommissionGroup[]>([]);
  const [selectedCommissionGroupId, setSelectedCommissionGroupId] = useState<string>("");
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCommissionGroups();
    }
  }, [isOpen]);

  const loadCommissionGroups = async () => {
    setIsLoadingGroups(true);
    setError(null);
    
    try {
      const { data, error } = await fetchCommissionGroups();
      
      if (error) {
        setError(`Failed to load commission groups: ${error.message}`);
        return;
      }
      
      if (data) {
        setCommissionGroups(data);
        // Set the current selection to the retailer's commission group if it exists
        if (retailer?.commission_group_id) {
          setSelectedCommissionGroupId(retailer.commission_group_id);
        } else {
          setSelectedCommissionGroupId("");
        }
      }
    } catch (err) {
      setError(
        `Error loading commission groups: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // Update the retailer with the selected commission group
      const { error } = await updateRetailer(retailer.id, {
        commission_group_id: selectedCommissionGroupId || undefined
      });
      
      if (error) {
        setError(`Failed to update commission group: ${error.message}`);
        return;
      }
      
      // Find the selected commission group to get its name
      const selectedGroup = commissionGroups.find(group => group.id === selectedCommissionGroupId);
      const selectedGroupName = selectedGroup ? selectedGroup.name : undefined;
      
      // Notify parent component of the update
      onUpdate(selectedCommissionGroupId || undefined, selectedGroupName);
      
      // Close the modal
      onClose();
    } catch (err) {
      setError(
        `Error updating commission group: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">
              Change Commission Group
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-2 hover:bg-muted">
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="mt-2 space-y-4">
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {isLoadingGroups ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Commission Group</label>
                  <select
                    value={selectedCommissionGroupId}
                    onChange={(e) => setSelectedCommissionGroupId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {commissionGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select a commission group to apply to this retailer
                  </p>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-md px-4 py-2 text-sm font-medium border border-input hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
