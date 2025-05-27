import { useRouter } from "next/router";
import { AuthGate } from "@/components/AuthGate";
import { ClientOnlyAuth } from "@/components/ClientOnlyAuth";
import { motion } from "framer-motion";

export default function AuthPage() {
  const router = useRouter();
  const { role } = router.query;

  // Get proper title case role name for display
  const getRoleDisplay = () => {
    if (!role) return "Account";
    return role.toString().charAt(0).toUpperCase() + role.toString().slice(1);
  };

  // Use a default role if not yet loaded from router
  const currentRole = (role as string) || "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-start">
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
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
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Portals
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-xl shadow-lg p-8 bg-card border border-border"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {getRoleDisplay()} Portal
          </h2>

          <AuthGate>
            <ClientOnlyAuth role={currentRole} />
          </AuthGate>
        </motion.div>
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
