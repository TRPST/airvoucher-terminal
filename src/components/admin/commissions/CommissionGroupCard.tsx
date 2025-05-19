import * as React from "react";
import { motion } from "framer-motion";
import { Pencil, Percent, XCircle, Check, Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";
import { type CommissionGroup } from "@/actions";

interface CommissionGroupCardProps {
  group: CommissionGroup;
  editGroup: string | null;
  isSaving: boolean;
  editedValues: Record<string, Record<string, number>>;
  startEditing: (groupId: string) => void;
  handleRateChange: (groupId: string, voucherType: string, value: string) => void;
  saveChanges: (groupId: string) => void;
  cancelEditing: (groupId: string) => void;
}

export function CommissionGroupCard({
  group,
  editGroup,
  isSaving,
  editedValues,
  startEditing,
  handleRateChange,
  saveChanges,
  cancelEditing,
}: CommissionGroupCardProps) {
  // Format percentage for display
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
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
  );
}
