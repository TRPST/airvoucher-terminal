import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import { UserCheck } from "lucide-react";

export default function CashierDashboard() {
  const router = useRouter();
  const { portal } = router.query;
  
  // Redirect to Cashier portal if not already there
  useEffect(() => {
    if (router.isReady && portal !== 'cashier') {
      router.replace('/portal/cashier/dashboard');
    }
  }, [router, portal]);

  // Portal configuration
  const portalConfig = {
    title: 'Cashier',
    icon: UserCheck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'Process voucher sales and manage transactions',
    features: ['Point of Sale', 'Transaction History', 'Daily Summary', 'Customer Service']
  };

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
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                // Sign out functionality would go here
                router.push('/portal/cashier/auth');
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
              <UserCheck size={24} />
            </div>
            <h1 className="text-3xl font-bold">
              Welcome to the Cashier Dashboard
            </h1>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">Portal Overview</h2>
            <p className="text-muted-foreground mb-4">
              {portalConfig.description}
            </p>
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