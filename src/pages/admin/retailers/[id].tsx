import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Store,
  Smartphone,
  DollarSign,
  CreditCard,
  Percent,
  Calendar,
  MoreHorizontal,
  ChevronDown,
  Plus,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";

import { StatsTile } from "@/components/ui/stats-tile";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import {
  fetchRetailers,
  fetchAdminTerminals,
  fetchSalesReport,
  createTerminal,
  updateRetailer,
  updateRetailerBalance,
  fetchCommissionGroups,
  fetchAgents,
  type AdminRetailer,
  type AdminTerminal,
  type SalesReport,
  type CommissionGroup,
} from "@/actions";

export default function RetailerDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "terminals"
  );

  // State for data and loading
  const [retailer, setRetailer] = useState<AdminRetailer | null>(null);
  const [terminals, setTerminals] = useState<AdminTerminal[]>([]);
  const [sales, setSales] = useState<SalesReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Terminal modal state
  const [showAddTerminalModal, setShowAddTerminalModal] = useState(false);
  const [terminalFormData, setTerminalFormData] = useState({
    name: "",
  });
  const [isSubmittingTerminal, setIsSubmittingTerminal] = useState(false);
  const [terminalFormError, setTerminalFormError] = useState<string | null>(
    null
  );

  // Commission group modal state
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionGroups, setCommissionGroups] = useState<CommissionGroup[]>([]);
  const [selectedCommissionGroupId, setSelectedCommissionGroupId] = useState<string>("");
  const [isLoadingCommissionGroups, setIsLoadingCommissionGroups] = useState(false);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);
  const [commissionFormError, setCommissionFormError] = useState<string | null>(null);

  // Sales agent modal state
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agents, setAgents] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false);
  const [agentFormError, setAgentFormError] = useState<string | null>(null);

  // Balance update modal state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceFormData, setBalanceFormData] = useState({
    availableBalance: "",
    creditLimit: "",
  });
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [balanceFormError, setBalanceFormError] = useState<string | null>(null);

  // Load retailer data
  useEffect(() => {
    async function loadRetailerData() {
      if (typeof id !== "string") return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch retailer info
        const { data: retailersData, error: retailerError } =
          await fetchRetailers();

        if (retailerError) {
          throw new Error(`Failed to load retailer: ${retailerError.message}`);
        }

        const foundRetailer = retailersData?.find((r) => r.id === id) || null;
        if (!foundRetailer) {
          throw new Error("Retailer not found");
        }

        setRetailer(foundRetailer);
        console.log('foundRetailer', foundRetailer);

        // Fetch terminals
        const { data: terminalsData, error: terminalsError } =
          await fetchAdminTerminals(id);

        if (terminalsError) {
          console.error("Error loading terminals:", terminalsError);
          // Continue with other data loading
        } else {
          setTerminals(terminalsData || []);
        }

        // Fetch sales
        const { data: salesData, error: salesError } = await fetchSalesReport(
          {}
        );

        if (salesError) {
          console.error("Error loading sales:", salesError);
          // Continue without sales data
        } else {
          // Filter sales for this retailer
          const retailerSales =
            salesData?.filter(
              (sale) => sale.retailer_name === foundRetailer.name
            ) || [];
          setSales(retailerSales);
        }
      } catch (err) {
        console.error("Error in retailer details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load retailer data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRetailerData();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading retailer details...</p>
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
            onClick={() => router.push("/admin/retailers")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Back to Retailers
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!retailer) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <Store className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Retailer Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The retailer you are looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/admin/retailers")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Back to Retailers
          </button>
        </div>
      </div>
    );
  }

  // Format terminal data for table
  const terminalData = terminals.map((terminal) => ({
    Name: terminal.name,
    Status: (
      <div
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          terminal.status === "active"
            ? "bg-green-500/10 text-green-500"
            : "bg-amber-500/10 text-amber-500"
        )}
      >
        {terminal.status.charAt(0).toUpperCase() + terminal.status.slice(1)}
      </div>
    ),
    "Last Active": terminal.last_active
      ? new Date(terminal.last_active).toLocaleString("en-ZA", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Never",
    Actions: (
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    ),
  }));

  // Format sales data for table
  const salesData = sales.slice(0, 5).map((sale) => ({
    Date: new Date(sale.created_at).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    Type: sale.voucher_type || "Unknown",
    Value: `R ${sale.amount.toFixed(2)}`,
    Commission: `R ${sale.retailer_commission.toFixed(2)}`,
    "PIN/Serial": "••••••••", // We don't expose PINs in the UI for security
  }));

  // Section toggle handler
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Terminal form handlers
  const handleTerminalInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTerminalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!terminalFormData.name.trim()) {
      setTerminalFormError("Terminal name is required");
      return;
    }

    if (typeof id !== "string") {
      setTerminalFormError("Invalid retailer ID");
      return;
    }

    setIsSubmittingTerminal(true);
    setTerminalFormError(null);

    try {
      // Create the terminal
      const { data, error } = await createTerminal(id, terminalFormData.name);

      if (error) {
        setTerminalFormError(`Failed to create terminal: ${error.message}`);
        return;
      }

      // Refresh the terminals list
      const { data: terminalsData } = await fetchAdminTerminals(id);
      if (terminalsData) {
        setTerminals(terminalsData);
      }

      // Close the modal and reset form
      setShowAddTerminalModal(false);
      setTerminalFormData({ name: "" });
    } catch (err) {
      setTerminalFormError(
        `Error creating terminal: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsSubmittingTerminal(false);
    }
  };
  
  // Load commission groups for modal
  const loadCommissionGroups = async () => {
    setIsLoadingCommissionGroups(true);
    setCommissionFormError(null);
    
    try {
      const { data, error } = await fetchCommissionGroups();
      
      if (error) {
        setCommissionFormError(`Failed to load commission groups: ${error.message}`);
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
      setCommissionFormError(
        `Error loading commission groups: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoadingCommissionGroups(false);
    }
  };
  
  // Handle commission group selection and update
  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof id !== "string") {
      setCommissionFormError("Invalid retailer ID");
      return;
    }
    
    setIsUpdatingCommission(true);
    setCommissionFormError(null);
    
    try {
      // Update the retailer with the selected commission group
      const { error } = await updateRetailer(id, {
        commission_group_id: selectedCommissionGroupId || undefined
      });
      
      if (error) {
        setCommissionFormError(`Failed to update commission group: ${error.message}`);
        return;
      }
      
      // Find the selected commission group to get its name
      const selectedGroup = commissionGroups.find(group => group.id === selectedCommissionGroupId);
      const selectedGroupName = selectedGroup ? selectedGroup.name : null;
      
      // Update the retailer state directly to ensure UI updates immediately
      setRetailer((prevRetailer) => {
        if (!prevRetailer) return prevRetailer;
        return {
          ...prevRetailer,
          commission_group_id: selectedCommissionGroupId || undefined,
          commission_group_name: selectedGroupName || undefined
        };
      });
      
      // Close the modal
      setShowCommissionModal(false);
    } catch (err) {
      setCommissionFormError(
        `Error updating commission group: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  // Load agents for modal
  const loadAgents = async () => {
    setIsLoadingAgents(true);
    setAgentFormError(null);
    
    try {
      const { data, error } = await fetchAgents();
      
      if (error) {
        setAgentFormError(`Failed to load agents: ${error.message}`);
        return;
      }
      
      if (data) {
        setAgents(data);
        // Set the current selection to the retailer's agent if it exists
        if (retailer?.agent_profile_id) {
          setSelectedAgentId(retailer.agent_profile_id);
        } else {
          setSelectedAgentId("");
        }
      }
    } catch (err) {
      setAgentFormError(
        `Error loading agents: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Handle agent selection and update
  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof id !== "string") {
      setAgentFormError("Invalid retailer ID");
      return;
    }
    
    setIsUpdatingAgent(true);
    setAgentFormError(null);
    
    try {
      // Update the retailer with the selected agent
      const { error } = await updateRetailer(id, {
        agent_profile_id: selectedAgentId || undefined
      });
      
      if (error) {
        setAgentFormError(`Failed to update sales agent: ${error.message}`);
        return;
      }
      
      // Find the selected agent to get its name
      const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
      const selectedAgentName = selectedAgent ? selectedAgent.full_name : null;
      
      // Update the retailer state directly to ensure UI updates immediately
      setRetailer((prevRetailer) => {
        if (!prevRetailer) return prevRetailer;
        return {
          ...prevRetailer,
          agent_profile_id: selectedAgentId || undefined,
          agent_name: selectedAgentName || undefined
        };
      });
      
      // Close the modal
      setShowAgentModal(false);
    } catch (err) {
      setAgentFormError(
        `Error updating sales agent: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsUpdatingAgent(false);
    }
  };

  // Balance form handlers
  const handleBalanceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setBalanceFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof id !== "string") {
      setBalanceFormError("Invalid retailer ID");
      return;
    }

    // Validation
    const availableBalance = parseFloat(balanceFormData.availableBalance);
    const creditLimit = parseFloat(balanceFormData.creditLimit);

    if (isNaN(availableBalance) || availableBalance < 0) {
      setBalanceFormError("Available balance must be a valid positive number");
      return;
    }

    if (isNaN(creditLimit) || creditLimit < 0) {
      setBalanceFormError("Credit limit must be a valid positive number");
      return;
    }

    setIsUpdatingBalance(true);
    setBalanceFormError(null);

    try {
      // Update the retailer balance
      const { error } = await updateRetailerBalance(id, availableBalance, creditLimit);

      if (error) {
        setBalanceFormError(`Failed to update balance: ${error.message}`);
        return;
      }

      // Update the retailer state directly to ensure UI updates immediately
      setRetailer((prevRetailer) => {
        if (!prevRetailer) return prevRetailer;
        return {
          ...prevRetailer,
          balance: availableBalance,
          credit_limit: creditLimit
        };
      });

      // Close the modal and reset form
      setShowBalanceModal(false);
      setBalanceFormData({
        availableBalance: "",
        creditLimit: "",
      });
    } catch (err) {
      setBalanceFormError(
        `Error updating balance: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/retailers">
        <button className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors group">
          <ChevronLeft className="mr-2 h-5 w-5 transition-transform duration-200 transform group-hover:-translate-x-1" />
          Back to retailers
        </button>
      </Link>
      <div style={{ marginTop: 10 }}>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Retailer Details
        </h1>
        <p className="text-muted-foreground">
          View and manage retailer information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary md:h-20 md:w-20">
            <Store className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold md:text-2xl">{retailer.name}</h2>
            <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Contact Person:</span>
                <span className="font-medium">
                  {retailer.contact_name || retailer.full_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Contact Email:</span>
                <span className="font-medium">
                  {retailer.contact_email || retailer.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
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
                  {retailer.status.charAt(0).toUpperCase() +
                    retailer.status.slice(1)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Sales Agent:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {retailer.agent_name || "None"}
                  </span>
                  <button
                    onClick={() => {
                      loadAgents();
                      setShowAgentModal(true);
                    }}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-muted"
                    title="Change sales agent"
                  >
                    Change
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Commission Group:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {retailer.commission_group_name || "None"}
                  </span>
                  <button
                    onClick={() => {
                      loadCommissionGroups();
                      setShowCommissionModal(true);
                    }}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-muted"
                    title="Change commission group"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Tiles */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Financial Overview</h3>
          <button
            onClick={() => {
              setBalanceFormData({
                availableBalance: retailer.balance.toString(),
                creditLimit: retailer.credit_limit.toString(),
              });
              setShowBalanceModal(true);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted"
            title="Update balances"
          >
            Update Balances
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsTile
            label="Available Balance"
            value={`R ${retailer.balance.toFixed(2)}`}
            icon={DollarSign}
            intent="success"
            subtitle="Current account balance"
          />
          <StatsTile
            label="Credit Limit"
            value={`R ${retailer.credit_limit.toFixed(2)}`}
            icon={CreditCard}
            intent="info"
            subtitle="Maximum credit allowed"
          />
          <StatsTile
            label="Commission Earned"
            value={`R ${retailer.commission_balance.toFixed(2)}`}
            icon={Percent}
            intent="info"
            subtitle="Total earned to date"
          />
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Terminals Section */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <button
            onClick={() => toggleSection("terminals")}
            className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Terminals</h3>
              <div className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {terminals.length}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                expandedSection === "terminals" && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === "terminals" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="border-t border-border p-4">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => setShowAddTerminalModal(true)}
                      className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Terminal
                    </button>
                  </div>
                  <TablePlaceholder
                    columns={["Name", "Status", "Last Active", "Actions"]}
                    data={terminalData}
                    emptyMessage="No terminals found for this retailer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sales History Section */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <button
            onClick={() => toggleSection("sales")}
            className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Sales History</h3>
              <div className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {sales.length}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                expandedSection === "sales" && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {expandedSection === "sales" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="border-t border-border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      Showing recent 5 of {sales.length} transactions
                    </div>
                    <button className="text-sm text-primary hover:underline">
                      View All
                    </button>
                  </div>
                  <TablePlaceholder
                    columns={[
                      "Date",
                      "Type",
                      "Value",
                      "Commission",
                      "PIN/Serial",
                    ]}
                    data={salesData}
                    emptyMessage="No sales found for this retailer"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Terminal Modal using Radix UI */}
      <Dialog.Root
        open={showAddTerminalModal}
        onOpenChange={setShowAddTerminalModal}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Add New Terminal
              </Dialog.Title>
              <Dialog.Close className="rounded-full p-2 hover:bg-muted">
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            <div className="mt-2 space-y-4">
              {terminalFormError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {terminalFormError}
                  </div>
                </div>
              )}

              <form onSubmit={handleTerminalSubmit}>
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Terminal Name</label>
                  <input
                    type="text"
                    name="name"
                    value={terminalFormData.name}
                    onChange={handleTerminalInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Enter terminal name"
                    required
                  />
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
                    disabled={isSubmittingTerminal}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingTerminal ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Processing...
                      </>
                    ) : (
                      "Add Terminal"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Commission Group Modal using Radix UI */}
      <Dialog.Root
        open={showCommissionModal}
        onOpenChange={setShowCommissionModal}
      >
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
              {commissionFormError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {commissionFormError}
                  </div>
                </div>
              )}

              {isLoadingCommissionGroups ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleCommissionSubmit}>
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
                      disabled={isUpdatingCommission}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingCommission ? (
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

      {/* Sales Agent Modal using Radix UI */}
      <Dialog.Root
        open={showAgentModal}
        onOpenChange={setShowAgentModal}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Change Sales Agent
              </Dialog.Title>
              <Dialog.Close className="rounded-full p-2 hover:bg-muted">
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            <div className="mt-2 space-y-4">
              {agentFormError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {agentFormError}
                  </div>
                </div>
              )}

              {isLoadingAgents ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleAgentSubmit}>
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium">Sales Agent</label>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">None</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select a sales agent to assign to this retailer
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
                      disabled={isUpdatingAgent}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdatingAgent ? (
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

      {/* Balance Update Modal using Radix UI */}
      <Dialog.Root
        open={showBalanceModal}
        onOpenChange={setShowBalanceModal}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Update Balances
              </Dialog.Title>
              <Dialog.Close className="rounded-full p-2 hover:bg-muted">
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </div>

            <div className="mt-2 space-y-4">
              {balanceFormError && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {balanceFormError}
                  </div>
                </div>
              )}

              <form onSubmit={handleBalanceSubmit}>
                <div className="space-y-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Balance</label>
                    <input
                      type="number"
                      name="availableBalance"
                      value={balanceFormData.availableBalance}
                      onChange={handleBalanceInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The amount available for voucher purchases
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credit Limit</label>
                    <input
                      type="number"
                      name="creditLimit"
                      value={balanceFormData.creditLimit}
                      onChange={handleBalanceInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum credit amount allowed for this retailer
                    </p>
                  </div>
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
                    disabled={isUpdatingBalance}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingBalance ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Updating...
                      </>
                    ) : (
                      "Update Balances"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
