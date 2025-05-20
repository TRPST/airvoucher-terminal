import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CreditCard,
  Phone,
  Film,
  Zap,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import useRequireRole from "@/hooks/useRequireRole";
import { cn } from "@/utils/cn";
import { fetchVoucherTypeSummaries, type VoucherTypeSummary } from "@/actions/adminActions";

// SafeComponent wrapper to catch rendering errors
function SafeComponent({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log("SafeComponent mounted");
  }, []);

  if (hasError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Rendering Error</h2>
          <p className="mb-4 text-muted-foreground">
            {errorDetails || "An unexpected error occurred while rendering this page."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Caught render error:", error);
    setErrorDetails(error instanceof Error ? error.message : "Unknown error");
    setHasError(true);
    return null;
  }
}

// Main component separated to handle errors properly
function VouchersPageContent() {
  console.log("VouchersPageContent render start");
  
  const [voucherTypes, setVoucherTypes] = React.useState<VoucherTypeSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  console.log("VouchersPageContent initial state:", { isLoading, error });

  // Fetch voucher type summaries
  React.useEffect(() => {
    console.log("VouchersPageContent useEffect running");
    
    let isMounted = true;
    
    async function loadData() {
      try {
        console.log("Starting to fetch voucher data...");
        setIsLoading(true);
        
        const { data, error: fetchError } = await fetchVoucherTypeSummaries();
        console.log("Voucher data fetch completed:", { data, error: fetchError });

        if (!isMounted) {
          console.log("Component unmounted, not updating state");
          return;
        }

        if (fetchError) {
          throw new Error(
            `Failed to load voucher types: ${fetchError.message}`
          );
        }

        setVoucherTypes(data || []);
        console.log('Voucher types set:', data);
      } catch (err) {
        console.error("Error in loadData:", err);
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load voucher types"
          );
        }
      } finally {
        if (isMounted) {
          console.log("Setting isLoading to false");
          setIsLoading(false);
        }
      }
    }

    loadData();
    
    return () => {
      console.log("VouchersPageContent useEffect cleanup");
      isMounted = false;
    };
  }, []);

  console.log("VouchersPageContent render state:", { 
    isLoading, 
    hasError: !!error, 
    voucherTypesCount: voucherTypes.length 
  });

  // Loading state
  if (isLoading) {
    console.log("Rendering loading state");
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Loading vouchers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log("Rendering error state:", error);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Error</h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log("Rendering voucher content");
  // Calculate overall stats
  const totalAvailableVouchers = voucherTypes.reduce(
    (sum, type) => sum + type.availableVouchers, 0
  );
  
  const totalVoucherValue = voucherTypes.reduce(
    (sum, type) => sum + type.totalValue, 0
  );
  
  const totalSoldVouchers = voucherTypes.reduce(
    (sum, type) => sum + type.soldVouchers, 0
  );
  
  const totalDisabledVouchers = voucherTypes.reduce(
    (sum, type) => sum + type.disabledVouchers, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Voucher Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage voucher stock and upload new vouchers.
          </p>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <h2 className="text-xl font-semibold">
                {totalAvailableVouchers.toLocaleString()} Available
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Total inventory value:{" "}
              <span className="font-semibold">
                R {totalVoucherValue.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-medium">
                  {totalSoldVouchers.toLocaleString()} Sold
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Used vouchers</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="font-medium">
                  {totalDisabledVouchers.toLocaleString()} Disabled
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Inactive vouchers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Type Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {voucherTypes.map((voucherType) => (
          <VoucherTypeCard key={voucherType.id} summary={voucherType} />
        ))}
        
        {voucherTypes.length === 0 && (
          <div className="col-span-3 rounded-lg border border-border bg-card p-10 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No Voucher Types Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There are no voucher types in the system. Contact an administrator to add voucher types.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// VoucherTypeCard component
const VoucherTypeCard = ({ summary }: { summary: VoucherTypeSummary }) => {
  const router = useRouter();
  // Get the appropriate icon based on the icon property
  const Icon = () => {
    switch (summary.icon) {
      case "phone":
        return <Phone className="h-6 w-6" />;
      case "film":
        return <Film className="h-6 w-6" />;
      case "zap":
        return <Zap className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  // Determine the color based on the voucher type name
  const getColor = () => {
    const name = summary.name.toLowerCase();
    if (name.includes("ringa")) return "blue";
    if (name.includes("hollywood")) return "amber";
    if (name.includes("easyload")) return "green";
    return "purple"; // Default
  };

  const color = getColor();
  
  // Define color variants for the icon container
  const colorVariants: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      className={cn(
        "flex flex-col h-full rounded-lg border border-border bg-card p-6 shadow-sm",
        "cursor-pointer hover:border-primary/20"
      )}
      onClick={() => {
        // Use Next.js router for client-side navigation
        router.push(`/admin/vouchers/${summary.id}`);
      }}
    >
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
            colorVariants[color]
          )}
        >
          <Icon />
        </div>
        <h3 className="mb-2 text-xl font-medium">{summary.name}</h3>
        
        <div className="mb-3 space-y-1">
          {/* Available vouchers */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available:</span>
            <span className="font-medium">{summary.availableVouchers.toLocaleString()}</span>
          </div>
          
          {/* Denominations
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Denominations:</span>
            <span className="font-medium text-right">
              {summary.uniqueAmounts.length > 0
                ? summary.uniqueAmounts.map((a: number) => `R${a}`).join(", ")
                : "None"}
            </span>
          </div> */}
          
          {/* Value */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="font-medium">R {summary.totalValue.toFixed(2)}</span>
          </div>
          
          {/* Supplier Commission */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Supplier Commission:</span>
            <span className="font-medium">{summary.supplierCommissionPct?.toFixed(2) || '0.00'}%</span>
          </div>
        </div>
        
        <div className="mt-auto flex items-center text-sm text-primary">
          <span>View Vouchers</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </motion.div>
  );
};

// Main exported component that adds auth protection
export default function AdminVouchers() {
  console.log("AdminVouchers component mounting");
  
  // Check if user is authorized as admin
  const { isLoading: isAuthLoading } = useRequireRole("admin");
  
  console.log("AdminVouchers auth state:", { isAuthLoading });

  React.useEffect(() => {
    console.log("AdminVouchers component mounted");
    return () => {
      console.log("AdminVouchers component unmounted");
    };
  }, []);

  if (isAuthLoading) {
    console.log("Rendering auth loading state");
    return (
      <div className="flex h-full items-center justify-center pt-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  try {
    console.log("Rendering SafeComponent with VouchersPageContent");
    return (
      <SafeComponent>
        <VouchersPageContent />
      </SafeComponent>
    );
  } catch (err) {
    console.error("Caught error in AdminVouchers:", err);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">Critical Error</h2>
          <p className="mb-4 text-muted-foreground">
            {err instanceof Error ? err.message : "A critical error occurred while rendering this page."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}
