import * as React from "react";
import { type CommissionGroup } from "@/actions";
import { CommissionGroupCard } from "./CommissionGroupCard";
import { type VoucherType } from "@/actions/admin/commissionActions";

interface CommissionGroupsGridProps {
  commissionGroups: CommissionGroup[];
  editGroup: string | null;
  isSaving: boolean;
  editedValues: Record<string, Record<string, {retailerPct: number, agentPct: number}>>;
  startEditing: (groupId: string) => void;
  handleRateChange: (groupId: string, voucherType: string, value: string, rateType: 'retailer' | 'agent') => void;
  saveChanges: (groupId: string) => void;
  cancelEditing: (groupId: string) => void;
  voucherTypes: VoucherType[];
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
  voucherTypes,
}: CommissionGroupsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-2">
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
          voucherTypes={voucherTypes}
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
