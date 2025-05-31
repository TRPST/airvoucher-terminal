import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { VALID_PORTALS, type PortalType } from "@/utils/subdomain";
import Link from "next/link";
import { Shield, Store, Users, UserCheck } from "lucide-react";

export default function PortalDashboard() {
  const router = useRouter();
  const { portal } = router.query;
  const [portalType, setPortalType] = useState<string | null>(null);
  
  // Set portal type once router is ready
  useEffect(() => {
    if (router.isReady && typeof portal === 'string') {
      setPortalType(portal);
    }
  }, [router.isReady, portal]);

  // Validate that the portal is one of our valid portal types
  const isValidPortal = portalType && VALID_PORTALS.includes(portalType as PortalType);

  // Redirect to home if portal is invalid
  useEffect(() => {
    if (router.isReady && !isValidPortal && portalType !== null) {
      router.push('/');
    }
  }, [router, isValidPortal, portalType]);

  // Redirect to portal-specific pages based on portal type
  useEffect(() => {
    if (router.isReady && portalType) {
      if (portalType === 'cashier') {
        router.push('/cashier');
      }
      // Add more redirects for other portal types if needed
    }
  }, [router, portalType]);

  // If portal is not valid or not yet loaded, show loading
  if (!isValidPortal) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Get portal-specific configuration
  const getPortalConfig = () => {
    switch(portalType) {
      case 'admin':
        return {
          title: 'Admin',
          icon: Shield,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          description: 'Manage retailers, vouchers, and platform settings',
          features: ['User Management', 'Platform Settings', 'System Reports', 'Retailer Approval']
        };
      case 'retailer':
        return {
          title: 'Retailer',
          icon: Store,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          description: 'Sell vouchers and manage your inventory',
          features: ['Inventory Management', 'Sales Reports', 'Customer Management', 'Voucher Sales']
        };
      case 'agent':
        return {
          title: 'Agent',
          icon: Users,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          description: 'Manage your retailer network and track commissions',
          features: ['Retailer Network', 'Commission Reports', 'Performance Tracking', 'Recruitment']
        };
      case 'cashier':
        return {
          title: 'Cashier',
          icon: UserCheck,
          color: 'text-purple-500',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          description: 'Process voucher sales and manage transactions',
          features: ['Point of Sale', 'Transaction History', 'Daily Summary', 'Customer Service']
        };
      default:
        return {
          title: 'Dashboard',
          icon: Shield,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          description: 'Access your portal features',
          features: ['Dashboard Features']
        };
    }
  };

  const portalConfig = getPortalConfig();
  const Icon = portalConfig.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${portalConfig.color}`}>
              {portalConfig.title} Portal
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Sign out functionality would go here
                router.push('/auth');
              }}
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 rounded-full ${portalConfig.bgColor} ${portalConfig.color}`}>
              <Icon size={24} />
            </div>
            <h1 className="text-3xl font-bold">
              Welcome to the {portalConfig.title} Dashboard
            </h1>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">Portal Overview</h2>
            <p className="text-muted-foreground mb-4">
              {portalConfig.description}
            </p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Current domain:</span>
              <code className="px-2 py-1 rounded bg-muted">
                {portalType}.baseUrl
              </code>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {portalConfig.features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all"
              >
                <h3 className="font-medium mb-2">{feature}</h3>
                <p className="text-sm text-muted-foreground">
                  Click to access this feature
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center text-sm text-muted-foreground">
            &copy; 2025 AirVoucher. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 