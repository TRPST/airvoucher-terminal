import * as React from "react";
import { type CommissionGroup } from "@/actions";
import { CommissionGroupCard } from "./CommissionGroupCard";

interface CommissionGroupsGridProps {
  commissionGroups: CommissionGroup[];
  editGroup: string | null;
  isSaving: boolean;
  editedValues: Record<string, Record<string, number>>;
  startEditing: (groupId: string) => void;
  handleRateChange: (groupId: string, voucherType: string, value: string) => void;
  saveChanges: (groupId: string) => void;
  cancelEditing: (groupId: string) => void;
}

export function CommissionGroupsGrid({
  commissionGroups,
  editGroup,
  isSaving,
  editedValues,
  startEditing,
  handleRateChange,
  saveChanges,
  cancelEditing,
}: CommissionGroupsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {commissionGroups.map((group) => (
        <CommissionGroupCard
          key={group.id}
          group={group}
          editGroup={editGroup}
          isSaving={isSaving}
          editedValues={editedValues}
          startEditing={startEditing}
          handleRateChange={handleRateChange}
          saveChanges={saveChanges}
          cancelEditing={cancelEditing}
        />
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
  );
}
