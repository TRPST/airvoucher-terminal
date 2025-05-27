import * as React from "react";
import {
  Wallet,
  CreditCard,
  Percent,
  HelpCircle,
  Building,
  User,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { StatsTile } from "@/components/ui/stats-tile";
import { cn } from "@/utils/cn";
import { fetchMyRetailer, type RetailerProfile } from "@/actions";
import useRequireRole from "@/hooks/useRequireRole";

export default function RetailerAccount() {
  // Protect this route - only allow retailer role
  const { isLoading, user, isAuthorized } = useRequireRole("retailer");

  // Get the current user ID
  const userId = user?.id;

  // State for retailer data and loading/error states
  const [retailer, setRetailer] = React.useState<RetailerProfile | null>(null);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [dataError, setDataError] = React.useState<string | null>(null);

  // Bank details (mock data) - moved before conditional returns
  const bankDetails = React.useMemo(() => ({
    accountName: "Soweto Corner Shop",
    accountNumber: "1234567890",
    bankName: "FNB",
    branchCode: "250655",
    accountType: "Business",
    reference: retailer ? "AV" + retailer.id.toUpperCase() : "",
  }), [retailer]);

  // Tooltip component - moved before conditional returns
  const Tooltip = React.useMemo(() => {
    return function TooltipComponent({ text }: { text: string }) {
      const [isVisible, setIsVisible] = React.useState(false);

      return (
        <div className="relative">
          <button
            className="text-muted-foreground hover:text-foreground"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -right-2 bottom-full z-50 mb-2 w-60 rounded-lg bg-popover p-3 text-sm text-popover-foreground shadow-md"
            >
              {text}
              <div className="absolute -bottom-1 right-2 h-2 w-2 rotate-45 bg-popover" />
            </motion.div>
          )}
        </div>
      );
    };
  }, []);

  // Fetch retailer data on mount
  React.useEffect(() => {
    const loadData = async () => {
      if (!userId || !isAuthorized) return;

      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch retailer profile
        const { data: retailerData, error: retailerError } =
          await fetchMyRetailer(userId);

        if (retailerError) {
          setDataError(
            `Failed to load retailer profile: ${retailerError.message}`
          );
          return;
        }

        if (!retailerData) {
          setDataError("No retailer profile found for this user");
          return;
        }

        setRetailer(retailerData);
      } catch (err) {
        setDataError(
          `Unexpected error: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [userId, isAuthorized]);

  // Calculate available credit
  const availableCredit = React.useMemo(() => {
    if (!retailer) return 0;
    return retailer.credit_limit - retailer.credit_used;
  }, [retailer]);

  // Show loading state while checking authentication or loading data
  if (isLoading || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Show error state if any
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

  // If retailer data hasn't loaded, show appropriate message
  if (!retailer) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-amber-500/10 p-3 text-amber-500">
          <Building className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Account Not Found</h2>
        <p className="max-w-md text-muted-foreground">
          We couldn't find your retailer account. Please contact support for
          assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Account
        </h1>
        <p className="text-muted-foreground">
          Manage your account details and view your balance.
        </p>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsTile
          label="Available Balance"
          value={`R ${retailer.balance.toFixed(2)}`}
          icon={Wallet}
          intent="success"
          subtitle="Current account balance"
        />
        <StatsTile
          label="Available Credit"
          value={`R ${availableCredit.toFixed(2)}`}
          icon={CreditCard}
          intent="warning"
          subtitle={`R ${retailer.credit_used.toFixed(2)} used of R ${retailer.credit_limit.toFixed(2)} limit`}
        />
        <StatsTile
          label="Pending Commission"
          value={`R ${retailer.commission_balance.toFixed(2)}`}
          icon={Percent}
          intent="info"
          subtitle="Ready for withdrawal"
        />
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Profile Information</h2>
            <button className="rounded-md px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">
              Edit
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">
                  {retailer.profile?.full_name || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{retailer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">
                  {retailer.profile?.email || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">+27 82 123 4567</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bank Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Bank Details</h2>
            <div className="flex items-center">
              <Tooltip text="These bank details are used for payouts when requesting commission withdrawals." />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Account Name</p>
              <p className="font-medium">{bankDetails.accountName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Account Number</p>
              <p className="font-medium">{bankDetails.accountNumber}</p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bank</p>
                <p className="font-medium">{bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Branch Code</p>
                <p className="font-medium">{bankDetails.branchCode}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className="font-medium">{bankDetails.accountType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-medium">{bankDetails.reference}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Commission Withdrawal */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Commission Withdrawal</h2>
          <div className="flex items-center gap-2">
            <Tooltip text="Withdrawals are processed within 2-3 business days. Minimum withdrawal amount is R100." />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium">Available for Withdrawal</h3>
                <p className="text-xl font-bold text-primary">
                  R {retailer.commission_balance.toFixed(2)}
                </p>
              </div>
              {retailer.commission_balance >= 100 ? (
                <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 sm:w-auto">
                  Request Withdrawal
                </button>
              ) : (
                <button
                  className="w-full cursor-not-allowed rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground sm:w-auto"
                  disabled
                >
                  Request Withdrawal
                </button>
              )}
            </div>
            {retailer.commission_balance < 100 && (
              <p className="mt-2 text-xs text-muted-foreground">
                You need a minimum of R100.00 to request a withdrawal.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Recent Withdrawals</h3>
            <div className="rounded-md bg-muted/50 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No recent withdrawals found.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
