import * as React from "react";
import { Plus, Store, Pencil, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { retailers, agents, commissionGroups } from "@/lib/MockData";
import { cn } from "@/utils/cn";

export default function AdminRetailers() {
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  // Format data for the table
  const tableData = retailers.map((retailer) => {
    const agent = agents.find((a) => a.id === retailer.agentId);
    const commissionGroup = commissionGroups.find(
      (cg) => cg.id === retailer.commissionGroupId
    );

    return {
      Name: (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{retailer.name}</div>
            <div className="text-xs text-muted-foreground">
              {retailer.email}
            </div>
          </div>
        </div>
      ),
      Agent: agent?.name || "None",
      "Commission Group": commissionGroup?.name || "None",
      Balance: `R ${retailer.balance.toFixed(2)}`,
      Status: (
        <div
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            retailer.status === "active"
              ? "bg-green-500/10 text-green-500"
              : retailer.status === "inactive"
              ? "bg-amber-500/10 text-amber-500"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {retailer.status.charAt(0).toUpperCase() + retailer.status.slice(1)}
        </div>
      ),
      Actions: (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/retailers/${retailer.id}`}
            className="rounded-md p-2 hover:bg-muted"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button className="rounded-md p-2 hover:bg-muted">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Retailers
          </h1>
          <p className="text-muted-foreground">
            Manage retailer accounts and settings.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Retailer
        </button>
      </div>

      <TablePlaceholder
        columns={[
          "Name",
          "Agent",
          "Commission Group",
          "Balance",
          "Status",
          "Actions",
        ]}
        data={tableData}
      />

      {/* Add Retailer Dialog (Mock) */}
      {showAddDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Retailer</h2>
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
                <label className="text-sm font-medium">Retailer Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter retailer name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Contact Person</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Contact person name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Contact email"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Agent</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select Agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Commission Group
                  </label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select Group</option>
                    {commissionGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Initial Credit Limit
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="0.00"
                />
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
                  Add Retailer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
