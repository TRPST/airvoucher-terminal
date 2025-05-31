import * as React from "react";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  User,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
  Terminal as TerminalIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  fetchMyRetailer,
  fetchRetailerTerminals as fetchTerminals,
  type RetailerProfile,
  type RetailerTerminal as Terminal,
} from "@/actions";
import { createTerminalForRetailer } from "@/actions/retailerActions";
import useRequireRole from "@/hooks/useRequireRole";

// Modal for creating/editing terminals
function TerminalModal({
  isOpen,
  onClose,
  onSubmit,
  terminal,
  isCreating,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  terminal?: Terminal;
  isCreating: boolean;
}) {
  const [formData, setFormData] = React.useState({
    name: terminal?.name || "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<any>({});

  React.useEffect(() => {
    if (terminal) {
      setFormData({
        name: terminal.name,
        email: "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [terminal]);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Terminal name is required";
    }
    
    if (isCreating && !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (isCreating && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (isCreating && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (isCreating && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 className="mb-4 text-xl font-semibold">
          {isCreating ? "Create New Terminal" : "Edit Terminal"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Terminal Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Terminal 1"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {isCreating && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Cashier Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="cashier@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Cashier Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isCreating ? "Create Terminal" : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function RetailerTerminals() {
  // Protect this route - only allow retailer role
  const { isLoading, user, isAuthorized } = useRequireRole("retailer");

  // Get the current user ID
  const userId = user?.id;

  // State for retailer data and loading/error states
  const [retailer, setRetailer] = React.useState<RetailerProfile | null>(null);
  const [terminals, setTerminals] = React.useState<Terminal[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [dataError, setDataError] = React.useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = React.useState(false);
  const [selectedTerminal, setSelectedTerminal] = React.useState<Terminal | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch retailer data and terminals on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch retailer profile
        const { data: retailerData, error: retailerError } = await fetchMyRetailer(userId);

        if (retailerError) {
          setDataError(`Failed to load retailer profile: ${retailerError.message}`);
          return;
        }

        if (!retailerData) {
          setDataError("No retailer profile found for this user");
          return;
        }

        setRetailer(retailerData);

        // Fetch terminals for this retailer
        const { data: terminalsData, error: terminalsError } = await fetchTerminals(retailerData.id);

        if (terminalsError) {
          setDataError(`Failed to load terminals: ${terminalsError.message}`);
          return;
        }

        setTerminals(terminalsData || []);
      } catch (err) {
        setDataError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized]);

  // Handle creating new terminal
  const handleCreateTerminal = () => {
    setSelectedTerminal(null);
    setIsCreating(true);
    setShowModal(true);
  };

  // Handle editing terminal
  const handleEditTerminal = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsCreating(false);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (data: any) => {
    if (!retailer) return;

    setIsSaving(true);
    
    try {
      if (isCreating) {
        // Create new terminal with cashier
        const { data: newTerminal, error } = await createTerminalForRetailer({
          retailerId: retailer.id,
          terminalName: data.name,
          cashierEmail: data.email,
          cashierPassword: data.password,
        });

        if (error) {
          alert(`Failed to create terminal: ${error.message}`);
          return;
        }

        // Refresh terminals list
        const { data: terminalsData } = await fetchTerminals(retailer.id);
        setTerminals(terminalsData || []);
      } else {
        // Update existing terminal (functionality to be implemented)
        alert("Terminal update functionality coming soon!");
      }

      setShowModal(false);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state
  if (isLoading || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Error Loading Data</h2>
        <p className="max-w-md text-muted-foreground">{dataError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Terminals
          </h1>
          <p className="text-muted-foreground">
            Manage your terminal points and cashier accounts.
          </p>
        </div>
        <button
          onClick={handleCreateTerminal}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Terminal
        </button>
      </div>

      {/* Terminals Grid */}
      {terminals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <TerminalIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No terminals yet</h3>
          <p className="mb-4 max-w-sm text-muted-foreground">
            Create your first terminal to enable cashiers to sell vouchers on your behalf.
          </p>
          <button
            onClick={handleCreateTerminal}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Terminal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {terminals.map((terminal) => (
            <motion.div
              key={terminal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{terminal.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {terminal.status === "active" ? (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-red-600">
                        <XCircle className="mr-1 h-4 w-4" />
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEditTerminal(terminal)}
                  className="rounded-md p-2 hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span>Terminal ID: {terminal.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Last active: {terminal.last_active ? new Date(terminal.last_active).toLocaleDateString() : "Never"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Terminal Modal */}
      <TerminalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        terminal={selectedTerminal || undefined}
        isCreating={isCreating}
      />
    </div>
  );
}
