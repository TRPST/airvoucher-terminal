import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface AddCommissionDialogProps {
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  formError: string | null;
  formData: {
    groupName: string;
    description: string;
    rates: Record<string, number>;
  };
  handleFormInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRateInputChange: (voucherTypeId: string, value: string) => void;
  handleCreateGroup: () => void;
  resetFormData: () => void;
  isCreating: boolean;
  categorizedVoucherTypes: {
    category: string;
    types: { id: string; name: string }[];
  }[];
}

export function AddCommissionDialog({
  showAddDialog,
  setShowAddDialog,
  formError,
  formData,
  handleFormInputChange,
  handleRateInputChange,
  handleCreateGroup,
  resetFormData,
  isCreating,
  categorizedVoucherTypes,
}: AddCommissionDialogProps) {
  if (!showAddDialog) return null;

  return (
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
  );
}
