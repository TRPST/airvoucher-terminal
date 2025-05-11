import * as React from "react";
import {
  Plus,
  Store,
  MoreHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@supabase/auth-helpers-react";

import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import {
  fetchRetailers,
  fetchCommissionGroups,
  createRetailer,
  type AdminRetailer,
  type CommissionGroup,
  type ProfileData,
  type RetailerData,
} from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

export default function AdminRetailers() {
  // Protect this route - only allow admin role
  const { isLoading: isRoleLoading } = useRequireRole("admin");

  // States for data
  const [retailers, setRetailers] = React.useState<AdminRetailer[]>([]);
  const [commissionGroups, setCommissionGroups] = React.useState<
    CommissionGroup[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Form state for adding a new retailer
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    businessName: string;
    contactName: string;
    email: string;
    location: string;
    agentId: string;
    commissionGroupId: string;
    initialBalance: string;
    creditLimit: string;
    password: string;
    autoGeneratePassword: boolean;
  }>({
    businessName: "",
    contactName: "",
    email: "",
    location: "",
    agentId: "",
    commissionGroupId: "",
    initialBalance: "0",
    creditLimit: "0",
    password: "",
    autoGeneratePassword: false,
  });

  // Load retailers and commission groups data
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch retailers
        const { data: retailersData, error: retailersError } =
          await fetchRetailers();

        if (retailersError) {
          setError(`Failed to load retailers: ${retailersError.message}`);
          return;
        }

        setRetailers(retailersData || []);

        // Fetch commission groups
        const { data: groupsData, error: groupsError } =
          await fetchCommissionGroups();

        if (groupsError) {
          setError(`Failed to load commission groups: ${groupsError.message}`);
          return;
        }

        setCommissionGroups(groupsData || []);
      } catch (err) {
        setError(
          `Unexpected error: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handler for input changes in the form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));

      // If auto-generate is checked, generate a random password
      if (name === "autoGeneratePassword" && checked) {
        const generatedPassword = generateRandomPassword();
        setFormData((prev) => ({ ...prev, password: generatedPassword }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Generate a random password with letters, numbers, and special characters
  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handler for re-generating password
  const handleRegeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData((prev) => ({ ...prev, password: newPassword }));
  };

  // Validate form before submission
  const validateForm = (): { isValid: boolean; error?: string } => {
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }

    // Check password length - Supabase requires at least 6 characters
    if (formData.password.length < 6) {
      return {
        isValid: false,
        error: "Password must be at least 6 characters long",
      };
    }

    return { isValid: true };
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form first
    const validation = validateForm();
    if (!validation.isValid) {
      setFormError(validation.error || "Invalid form submission");
      return;
    }

    setIsSubmitting(true);
    setFormError(null); // Clear any previous form errors
    setError(null); // Clear any previous page errors

    try {
      // Create profile data
      const profileData: ProfileData = {
        full_name: formData.contactName,
        email: formData.email,
        role: "retailer",
      };

      // Create retailer data
      const retailerData: RetailerData = {
        name: formData.businessName,
        contact_name: formData.contactName,
        contact_email: formData.email,
        location: formData.location,
        agent_profile_id: formData.agentId || undefined,
        commission_group_id: formData.commissionGroupId || undefined,
        initial_balance: parseFloat(formData.initialBalance) || 0,
        credit_limit: parseFloat(formData.creditLimit) || 0,
        status: "active",
      };

      // Call the createRetailer action with the new parameter format
      const { data, error } = await createRetailer({
        profileData,
        retailerData,
        password: formData.password,
      });

      if (error) {
        setFormError(`Failed to create retailer: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Add the new retailer to the list and close the dialog
      if (data) {
        // Refresh the retailer list instead of trying to add incomplete data
        const { data: refreshedData } = await fetchRetailers();
        if (refreshedData) {
          setRetailers(refreshedData);
        }
        setShowAddDialog(false);

        // Reset form data
        setFormData({
          businessName: "",
          contactName: "",
          email: "",
          location: "",
          agentId: "",
          commissionGroupId: "",
          initialBalance: "0",
          creditLimit: "0",
          password: "",
          autoGeneratePassword: false,
        });
      }
    } catch (err) {
      setError(
        `Error creating retailer: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isRoleLoading || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading retailers...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Error Loading Data</h2>
        <p className="max-w-md text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Format data for the table
  const tableData = retailers.map((retailer) => {
    const row = {
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
      Agent: retailer.agent_name || "None",
      "Commission Group": retailer.commission_group_name || "None",
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
    };

    // Wrap each row in a Link component
    return Object.entries(row).reduce((acc, [key, value]) => {
      acc[key] = (
        <Link
          href={`/admin/retailers/${retailer.id}`}
          className="cursor-pointer"
          style={{ display: "block" }}
        >
          {value}
        </Link>
      );
      return acc;
    }, {} as Record<string, React.ReactNode>);
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
        columns={["Name", "Agent", "Commission Group", "Balance", "Status"]}
        data={tableData}
        rowsClickable={true}
      />

      {/* Add Retailer Dialog (Mock) */}
      {showAddDialog && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
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
            <div className="mt-4 space-y-6">
              {formError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {formError}
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Retailer Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Enter retailer name"
                    required
                  />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Contact Person</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Contact person name"
                    required
                  />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Contact email"
                    required
                  />
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Business location"
                  />
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Password</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoGeneratePassword"
                        name="autoGeneratePassword"
                        checked={formData.autoGeneratePassword}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor="autoGeneratePassword"
                        className="text-sm text-muted-foreground"
                      >
                        Auto-generate password
                      </label>
                    </div>
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={formData.autoGeneratePassword}
                      className="w-full rounded-md rounded-r-none border border-input bg-background px-3 py-2 text-sm"
                      placeholder={
                        formData.autoGeneratePassword
                          ? "Auto-generated password"
                          : "Set password"
                      }
                      required
                    />
                    {formData.autoGeneratePassword && (
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        className="flex items-center justify-center rounded-md rounded-l-none border border-l-0 border-input bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/90"
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  {formData.autoGeneratePassword && (
                    <p className="text-xs text-muted-foreground">
                      This password will be used for the retailer's login
                      account.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Agent</label>
                    <select
                      name="agentId"
                      value={formData.agentId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Agent</option>
                      {retailers
                        .filter((r) => r.agent_profile_id) // Only get unique agent IDs
                        .map((retailer) => (
                          <option
                            key={retailer.agent_profile_id}
                            value={retailer.agent_profile_id}
                          >
                            {retailer.agent_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Commission Group
                    </label>
                    <select
                      name="commissionGroupId"
                      value={formData.commissionGroupId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Group</option>
                      {commissionGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">
                    Initial Available Balance
                  </label>
                  <input
                    type="number"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium">Credit Limit</label>
                  <input
                    type="number"
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(false)}
                    className="rounded-md px-4 py-2 text-sm font-medium border border-input hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Add Retailer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
